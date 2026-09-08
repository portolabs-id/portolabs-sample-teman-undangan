import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { uploadPhotoAction, deletePhotoAction } from "@/app/(app)/builder/[id]/photo-actions";
import { GalleryManager } from "@/app/(app)/builder/[id]/gallery-manager";

vi.mock("@/app/(app)/builder/[id]/photo-actions", () => ({
  uploadPhotoAction: vi.fn(),
  deletePhotoAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("GalleryManager", () => {
  it("shows the empty state when there are no photos", () => {
    const { container } = render(<GalleryManager id="i1" photos={[]} />);
    expect(screen.getByText("Belum ada foto. Unggah foto pertama Anda.")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("renders a grid of existing photos", () => {
    const { container } = render(
      <GalleryManager
        id="i1"
        photos={[
          { id: "p1", url: "/api/media/g1.jpg" },
          { id: "p2", url: "/api/media/g2.jpg" },
        ]}
      />
    );
    expect(screen.queryByText("Belum ada foto. Unggah foto pertama Anda.")).not.toBeInTheDocument();
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/api/media/g1.jpg");
  });

  it("uploads a photo and toasts success", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadPhotoAction).mockResolvedValueOnce(undefined);
    const { container } = render(<GalleryManager id="i1" photos={[]} />);

    const file = new File(["data"], "photo.png", { type: "image/png" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    // jsdom mis-tracks `.value`/validity for populated file inputs (a known jsdom
    // limitation), so a real click-driven requestSubmit is blocked by the native
    // `required` constraint even though a file is attached; dispatch the submit
    // event directly instead of going through the submit button.
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Foto diunggah"));
    expect(uploadPhotoAction).toHaveBeenCalledWith("i1", expect.any(FormData));
  });

  it("toasts the error message when upload fails", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadPhotoAction).mockRejectedValueOnce(new Error("File terlalu besar (maks 5MB)"));
    const { container } = render(<GalleryManager id="i1" photos={[]} />);

    const file = new File(["data"], "photo.png", { type: "image/png" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("File terlalu besar (maks 5MB)"));
  });

  it("deletes a photo via the bound delete action", async () => {
    const user = userEvent.setup();
    vi.mocked(deletePhotoAction).mockResolvedValueOnce(undefined);
    render(<GalleryManager id="i1" photos={[{ id: "p1", url: "/api/media/g1.jpg" }]} />);

    await user.click(screen.getByRole("button", { name: "Hapus foto" }));

    await waitFor(() => expect(deletePhotoAction).toHaveBeenCalledWith("i1", "p1", expect.any(FormData)));
  });
});
