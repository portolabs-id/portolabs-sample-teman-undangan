import type { TemplateProps } from "./registry";
import { Hero } from "./sections/Hero";
import { Couple } from "./sections/Couple";
import { Events } from "./sections/Events";
import { Maps } from "./sections/Maps";
import { Gallery } from "./sections/Gallery";
import { Envelope } from "./sections/Envelope";

export function ModernTemplate({ view, guest, rsvpSlot }: TemplateProps) {
  return (
    <main className="bg-neutral-950 font-sans text-neutral-100 [&_.bg-white\/70]:bg-black/50 [&_h1]:text-white [&_h2]:tracking-tight">
      <Hero view={view} guest={guest} />
      <Couple view={view} />
      <Events view={view} />
      <Maps view={view} />
      <Gallery view={view} />
      <Envelope view={view} />
      {rsvpSlot}
      <footer className="py-10 text-center text-xs text-neutral-500">Dibuat dengan Teman Undangan</footer>
    </main>
  );
}
