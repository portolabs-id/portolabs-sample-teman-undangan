import type { InvitationView } from "@/lib/invitations/view-model";
import { Hero } from "./sections/Hero";
import { Couple } from "./sections/Couple";
import { Events } from "./sections/Events";
import { Maps } from "./sections/Maps";
import { Gallery } from "./sections/Gallery";
import { Envelope } from "./sections/Envelope";

export function ClassicTemplate({ view, guest, rsvpSlot }: { view: InvitationView; guest?: string; rsvpSlot?: React.ReactNode }) {
  return (
    <main className="bg-stone-50 font-sans text-stone-800">
      <Hero view={view} guest={guest} />
      <Couple view={view} />
      <Events view={view} />
      <Maps view={view} />
      <Gallery view={view} />
      <Envelope view={view} />
      {rsvpSlot}
      <footer className="py-10 text-center text-xs text-muted-foreground">Dibuat dengan Teman Undangan</footer>
    </main>
  );
}
