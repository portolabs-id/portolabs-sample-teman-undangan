import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as navigation from "next/navigation";
import { signIn, signUp } from "@/lib/auth/client";
import { toast } from "sonner";
import { AuthForm } from "@/components/auth-form";

vi.mock("@/lib/auth/client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

async function fillCommonFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "guest@example.com");
  await user.type(screen.getByLabelText("Kata sandi"), "supersecret");
}

describe("AuthForm", () => {
  const push = vi.fn();

  beforeEach(() => {
    push.mockClear();
    vi.spyOn(navigation, "useRouter").mockReturnValue({
      push,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof navigation.useRouter>);
  });

  it("renders login mode without a name field and the Masuk label", () => {
    render(<AuthForm mode="login" />);
    expect(screen.queryByLabelText("Nama")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toHaveAttribute("autoComplete", "current-password");
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("renders register mode with a name field and the Daftar label", () => {
    render(<AuthForm mode="register" />);
    expect(screen.getByLabelText("Nama")).toHaveAttribute("autoComplete", "name");
    expect(screen.getByLabelText("Kata sandi")).toHaveAttribute("autoComplete", "new-password");
    expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument();
  });

  it("does not show the turnstile widget in register mode without a site key", () => {
    const { container } = render(<AuthForm mode="register" />);
    expect(container.querySelector(".cf-turnstile")).not.toBeInTheDocument();
  });

  it("does not show the turnstile widget in login mode even with a site key", () => {
    const { container } = render(<AuthForm mode="login" turnstileSiteKey="site-key" />);
    expect(container.querySelector(".cf-turnstile")).not.toBeInTheDocument();
  });

  it("shows the turnstile widget in register mode with a site key", () => {
    const { container } = render(<AuthForm mode="register" turnstileSiteKey="site-key" />);
    const widget = container.querySelector(".cf-turnstile");
    expect(widget).toHaveAttribute("data-sitekey", "site-key");
    expect(widget).toHaveAttribute("data-action", "register");
    expect(document.head.querySelector("script")).toHaveAttribute(
      "src",
      "https://challenges.cloudflare.com/turnstile/v0/api.js"
    );
  });

  it("shows the loading state and pushes to /dashboard on a successful login", async () => {
    const user = userEvent.setup();
    let resolveSignIn!: (value: { error: null }) => void;
    vi.mocked(signIn.email).mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }) as unknown as ReturnType<typeof signIn.email>
    );
    render(<AuthForm mode="login" />);
    await fillCommonFields(user);
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("button", { name: "Memproses…" })).toBeDisabled();

    resolveSignIn({ error: null });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(signIn.email).toHaveBeenCalledWith({ email: "guest@example.com", password: "supersecret" });
  });

  it("sends the name and empty turnstile token on a successful register submit without a site key", async () => {
    const user = userEvent.setup();
    vi.mocked(signUp.email).mockResolvedValue({ error: null } as unknown as Awaited<
      ReturnType<typeof signUp.email>
    >);
    render(<AuthForm mode="register" />);
    await fillCommonFields(user);
    await user.type(screen.getByLabelText("Nama"), "Budi Santoso");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(signUp.email).toHaveBeenCalledWith(
      { email: "guest@example.com", password: "supersecret", name: "Budi Santoso" },
      { headers: { "x-turnstile-token": "" } }
    );
  });

  it("reads the turnstile token from the form when it was populated by the widget", async () => {
    const user = userEvent.setup();
    vi.mocked(signUp.email).mockResolvedValue({ error: null } as unknown as Awaited<
      ReturnType<typeof signUp.email>
    >);
    const { container } = render(<AuthForm mode="register" turnstileSiteKey="site-key" />);
    const form = container.querySelector("form")!;
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "cf-turnstile-response";
    hiddenInput.value = "turnstile-token-abc";
    form.appendChild(hiddenInput);

    await fillCommonFields(user);
    await user.type(screen.getByLabelText("Nama"), "Budi Santoso");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(signUp.email).toHaveBeenCalledWith(
      { email: "guest@example.com", password: "supersecret", name: "Budi Santoso" },
      { headers: { "x-turnstile-token": "turnstile-token-abc" } }
    );
  });

  it("shows the server error message and resets turnstile when window.turnstile exists", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    window.turnstile = { reset };
    vi.mocked(signIn.email).mockResolvedValue({
      error: { message: "Email sudah dipakai" },
    } as unknown as Awaited<ReturnType<typeof signIn.email>>);

    render(<AuthForm mode="login" />);
    await fillCommonFields(user);
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Email sudah dipakai"));
    expect(reset).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    delete window.turnstile;
  });

  it("falls back to Gagal masuk when a login error has no message and window.turnstile is absent", async () => {
    const user = userEvent.setup();
    delete window.turnstile;
    vi.mocked(signIn.email).mockResolvedValue({ error: {} } as unknown as Awaited<
      ReturnType<typeof signIn.email>
    >);

    render(<AuthForm mode="login" />);
    await fillCommonFields(user);
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Gagal masuk"));
  });

  it("falls back to Gagal daftar when a register error has no message", async () => {
    const user = userEvent.setup();
    vi.mocked(signUp.email).mockResolvedValue({ error: {} } as unknown as Awaited<
      ReturnType<typeof signUp.email>
    >);

    render(<AuthForm mode="register" />);
    await fillCommonFields(user);
    await user.type(screen.getByLabelText("Nama"), "Budi Santoso");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Gagal daftar"));
  });
});
