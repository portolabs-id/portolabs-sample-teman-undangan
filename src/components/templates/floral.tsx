import type { TemplateProps } from "./registry";
import { Hero } from "./sections/Hero";
import { Couple } from "./sections/Couple";
import { Events } from "./sections/Events";
import { Maps } from "./sections/Maps";
import { Gallery } from "./sections/Gallery";
import { Envelope } from "./sections/Envelope";

export function FloralTemplate({ view, guest, rsvpSlot }: TemplateProps) {
  return (
    <main className="bg-rose-50 font-serif text-rose-950 [&_h1]:text-rose-800 [&_h2]:text-rose-700">
      <Hero view={view} guest={guest} />
      <div className="mx-auto h-px max-w-xs bg-rose-200" />
      <Couple view={view} />
      <Events view={view} />
      <Maps view={view} />
      <Gallery view={view} />
      <Envelope view={view} />
      {rsvpSlot}
      <footer className="py-10 text-center text-xs text-rose-400">Dibuat dengan Teman Undangan</footer>
    </main>
  );
}
