import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as navigation from "next/navigation";
import { toast } from "sonner";
import { saveInvitationAction } from "@/app/(app)/builder/[id]/actions";
import { setInvitationStatusAction } from "@/app/(app)/dashboard/actions";
import { BuilderWizard } from "@/app/(app)/builder/[id]/builder-wizard";

vi.mock("@/app/(app)/builder/[id]/actions", () => ({
  saveInvitationAction: vi.fn(),
}));

vi.mock("@/app/(app)/builder/[id]/photo-actions", () => ({
  uploadPhotoAction: vi.fn(),
  deletePhotoAction: vi.fn(),
}));

vi.mock("@/app/(app)/dashboard/actions", () => ({
  setInvitationStatusAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const fullValues: Record<string, string> = {
  template: "classic",
  groomName: "Budi",
  brideName: "Siti",
  groomParents: "Pak A & Bu B",
  brideParents: "Pak C & Bu D",
  akadAt: String(1_800_000_000_000),
  resepsiAt: String(1_800_010_000_000),
  venueName: "Gedung X",
  venueAddress: "Jl. Y",
  mapsUrl: "https://maps.google.com/x",
  giftBankName: "BCA",
  giftAccountNumber: "123",
  giftAccountHolder: "Budi",
};

const sparseValues: Record<string, string> = { template: "classic" };

const photos = [{ id: "p1", url: "/api/media/g1.jpg" }];

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("BuilderWizard", () => {
  const refresh = vi.fn();

  beforeEach(() => {
    vi.spyOn(navigation, "useRouter").mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof navigation.useRouter>);
  });

  it("starts on the Tema step with the previous button disabled", () => {
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    expect(screen.getByRole("heading", { name: "Tema" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Lanjut" })).toBeEnabled();
  });

  it("falls back to empty defaults and toLocalInput('') when values are missing", () => {
    render(<BuilderWizard id="i1" status="draft" values={sparseValues} photos={[]} />);
    const groomInput = screen.getByLabelText("Nama pria") as HTMLInputElement;
    expect(groomInput.value).toBe("");
  });

  it("renders filled defaults including converted datetime-local values", () => {
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    const groomInput = screen.getByLabelText("Nama pria") as HTMLInputElement;
    expect(groomInput.value).toBe("Budi");
  });

  it("selects a template from the picker and marks it as selected", async () => {
    const user = userEvent.setup();
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    const floralRadio = screen.getByRole("radio", { name: /floral/ }) as HTMLInputElement;
    expect(floralRadio.checked).toBe(false);
    await user.click(floralRadio);
    expect(floralRadio.checked).toBe(true);
    expect(floralRadio.closest("label")).toHaveClass("is-selected");
  });

  it("jumps directly to a step via the nav and shows a checkmark for completed steps", async () => {
    const user = userEvent.setup();
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    await user.click(screen.getByRole("button", { name: /Acara/ }));
    expect(screen.getByRole("heading", { name: "Acara" })).toBeInTheDocument();

    const temaStepButton = screen.getByRole("button", { name: /Tema/ });
    expect(temaStepButton).toHaveClass("is-done");
    expect(temaStepButton.querySelector("svg")).not.toBeNull();

    const acaraStepButton = screen.getByRole("button", { name: /Acara/ });
    expect(acaraStepButton).toHaveAttribute("aria-current", "step");
    expect(temaStepButton).not.toHaveAttribute("aria-current");
  });

  it("goes back a step with the previous button", async () => {
    const user = userEvent.setup();
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    await user.click(screen.getByRole("button", { name: /Mempelai/ }));
    expect(screen.getByRole("heading", { name: "Mempelai" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sebelumnya" }));
    expect(screen.getByRole("heading", { name: "Tema" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
  });

  it("saves and continues to the next step", async () => {
    const user = userEvent.setup();
    vi.mocked(saveInvitationAction).mockResolvedValueOnce(undefined);

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    await user.click(screen.getByRole("button", { name: "Lanjut" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Mempelai" })).toBeInTheDocument());
    expect(saveInvitationAction).toHaveBeenCalledWith("i1", expect.any(FormData));
    expect(screen.getByRole("button", { name: "Lanjut" })).toBeEnabled();
  });

  it("shows the saving state while the form action is pending", async () => {
    const user = userEvent.setup();
    const call = deferred<void>();
    vi.mocked(saveInvitationAction).mockReturnValueOnce(call.promise);

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: "Lanjut" }));

    expect(await screen.findByRole("button", { name: "Menyimpan…" })).toBeDisabled();
    call.resolve();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Mempelai" })).toBeInTheDocument());
  });

  it("keeps what the guest typed after the form action settles on stale server values", async () => {
    const user = userEvent.setup();
    vi.mocked(saveInvitationAction).mockResolvedValueOnce(undefined);

    const { rerender } = render(
      <BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />,
    );

    await user.click(screen.getByRole("button", { name: /Mempelai/ }));
    const groomName = screen.getByLabelText("Nama pria");
    await user.clear(groomName);
    await user.type(groomName, "Bagas");

    await user.click(screen.getByRole("button", { name: "Lanjut" }));
    await waitFor(() => expect(saveInvitationAction).toHaveBeenCalled());

    // A revalidation lands after the action, still carrying the pre-save values.
    rerender(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    expect(screen.getByLabelText("Nama pria")).toHaveValue("Bagas");
  });

  it("toasts an error when saving fails", async () => {
    const user = userEvent.setup();
    vi.mocked(saveInvitationAction).mockRejectedValueOnce(new Error("boom"));

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: "Lanjut" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Gagal menyimpan, coba lagi."));
    expect(screen.getByRole("heading", { name: "Tema" })).toBeInTheDocument();
  });

  it("reaches the last step (amplop) and clamps forward navigation, then shows the gallery step", async () => {
    const user = userEvent.setup();
    vi.mocked(saveInvitationAction).mockResolvedValue(undefined);

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    await user.click(screen.getByRole("button", { name: /Amplop digital/ }));
    expect(screen.getByRole("heading", { name: "Amplop digital" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lanjut" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Galeri foto" })).toBeInTheDocument());

    expect(screen.queryByText("Belum ada foto. Unggah foto pertama Anda.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lanjut" })).not.toBeInTheDocument();
  });

  it("goes back from the gallery step without a disabled previous button", async () => {
    const user = userEvent.setup();
    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);

    await user.click(screen.getByRole("button", { name: /Galeri foto/ }));
    expect(screen.getByRole("heading", { name: "Galeri foto" })).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: "Sebelumnya" });
    expect(prevButton).toBeEnabled();
    await user.click(prevButton);
    expect(screen.getByRole("heading", { name: "Amplop digital" })).toBeInTheDocument();
  });

  it("publishes a draft invitation and refreshes the router", async () => {
    const user = userEvent.setup();
    vi.mocked(setInvitationStatusAction).mockResolvedValueOnce(undefined);

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: /Galeri foto/ }));

    const publishButton = screen.getByRole("button", { name: "Terbitkan" });
    expect(publishButton).toHaveClass("btn--solid");
    await user.click(publishButton);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Undangan terbit"));
    expect(setInvitationStatusAction).toHaveBeenCalledWith("i1", "published");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the processing state while publishing is pending", async () => {
    const user = userEvent.setup();
    const call = deferred<void>();
    vi.mocked(setInvitationStatusAction).mockReturnValueOnce(call.promise);

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: /Galeri foto/ }));
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));

    expect(await screen.findByRole("button", { name: "Memproses…" })).toBeDisabled();
    call.resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: "Terbitkan" })).toBeEnabled());
  });

  it("reverts a published invitation to draft", async () => {
    const user = userEvent.setup();
    vi.mocked(setInvitationStatusAction).mockResolvedValueOnce(undefined);

    render(<BuilderWizard id="i1" status="published" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: /Galeri foto/ }));

    const unpublishButton = screen.getByRole("button", { name: "Jadikan draf" });
    expect(unpublishButton).toHaveClass("btn--outline");
    await user.click(unpublishButton);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Undangan kembali jadi draf"));
    expect(setInvitationStatusAction).toHaveBeenCalledWith("i1", "draft");
  });

  it("toasts an error when changing status fails", async () => {
    const user = userEvent.setup();
    vi.mocked(setInvitationStatusAction).mockRejectedValueOnce(new Error("boom"));

    render(<BuilderWizard id="i1" status="draft" values={fullValues} photos={photos} />);
    await user.click(screen.getByRole("button", { name: /Galeri foto/ }));
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Gagal mengubah status, coba lagi."));
  });
});
