"use client";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";
import { uploadPhotoAction, deletePhotoAction } from "./photo-actions";

type Pic = { id: string; url: string };

export function GalleryManager({ id, photos }: { id: string; photos: Pic[] }) {
  return (
    <div className="gallery">
      <form
        action={async (fd) => {
          try {
            await uploadPhotoAction(id, fd);
            toast.success("Foto diunggah");
          } catch (e) {
            toast.error((e as Error).message);
          }
        }}
        className="gallery__upload"
      >
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required />
        <button type="submit" className="btn btn--solid">Unggah</button>
      </form>

      {photos.length === 0 ? (
        <p className="gallery__empty">Belum ada foto. Unggah foto pertama Anda.</p>
      ) : (
        <div className="gallery__grid">
          {photos.map((p) => (
            <div key={p.id} className="gallery__item">
              <Image src={p.url} alt="" fill className="object-cover" sizes="160px" unoptimized />
              <form action={deletePhotoAction.bind(null, id, p.id)}>
                <button type="submit" className="gallery__remove" aria-label="Hapus foto">
                  <X size={14} strokeWidth={3} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
