"use client";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadPhotoAction, deletePhotoAction } from "./photo-actions";

type Pic = { id: string; url: string };

export function GalleryManager({ id, photos }: { id: string; photos: Pic[] }) {
  return (
    <div className="grid gap-4">
      <h2 className="font-semibold">Galeri Foto</h2>
      <form
        action={async (fd) => {
          try {
            await uploadPhotoAction(id, fd);
            toast.success("Foto diunggah");
          } catch (e) {
            toast.error((e as Error).message);
          }
        }}
        className="flex items-center gap-2"
      >
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required />
        <Button type="submit" size="sm">Unggah</Button>
      </form>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-md border">
            <Image src={p.url} alt="" fill className="object-cover" sizes="120px" unoptimized />
            <form action={deletePhotoAction.bind(null, id, p.id)} className="absolute right-1 top-1">
              <Button size="sm" variant="destructive" className="h-6 px-2 text-xs">×</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
