import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLayout from "@/app/(auth)/layout";

describe("AuthLayout", () => {
  it("renders the brand, every selling point, and the form-side children", () => {
    render(
      <AuthLayout>
        <p>form content</p>
      </AuthLayout>,
    );

    expect(screen.getByText("Undangan pernikahan digital yang menyapa tamu Anda")).toBeInTheDocument();
    expect(screen.getByText("Link personal untuk tiap tamu, lengkap dengan namanya")).toBeInTheDocument();
    expect(screen.getByText("RSVP dan ucapan masuk langsung ke dashboard")).toBeInTheDocument();
    expect(screen.getByText("Tiga tema siap pakai, bisa diganti tanpa mengubah link")).toBeInTheDocument();
    expect(screen.getByText("form content")).toBeInTheDocument();
  });
});
