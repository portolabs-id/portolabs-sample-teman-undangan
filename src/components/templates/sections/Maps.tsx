import type { InvitationView } from "@/lib/invitations/view-model";

export function Maps({ view }: { view: InvitationView }) {
  if (!view.mapsUrl) return null;
  return (
    <section className="mx-auto grid max-w-2xl gap-4 px-6 py-12 text-center">
      <h2 className="font-serif text-3xl">Lokasi</h2>
      <a className="mx-auto inline-block rounded-md bg-black px-4 py-2 text-sm text-white" href={view.mapsUrl} target="_blank" rel="noreferrer">
        Buka di Google Maps
      </a>
    </section>
  );
}
