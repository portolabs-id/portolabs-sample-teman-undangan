import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

describe("LoginPage", () => {
  it("renders the login form and a link to register", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByText("Lanjutkan mengelola undangan dan daftar tamu Anda.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/register");
  });
});
