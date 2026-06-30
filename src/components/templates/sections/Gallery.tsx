import Image from "next/image";
import type { InvitationView } from "@/lib/invitations/view-model";

export function Gallery({ view }: { view: InvitationView }) {
  if (view.gallery.length === 0) return null;
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-6 py-12">
      <h2 className="text-center font-serif text-3xl">Galeri</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {view.gallery.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
            <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px) 50vw, 33vw" unoptimized />
          </div>
        ))}
      </div>
    </section>
  );
}
