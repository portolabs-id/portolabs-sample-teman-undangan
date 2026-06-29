import { googleCalendarUrl } from "@/lib/dates";
import type { InvitationView } from "@/lib/invitations/view-model";

function fmt(ms: number): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(ms);
}

export function Events({ view }: { view: InvitationView }) {
  const items = [
    { label: "Akad Nikah", at: view.akadAt },
    { label: "Resepsi", at: view.resepsiAt },
  ].filter((e) => e.at) as { label: string; at: number }[];

  return (
    <section className="mx-auto grid max-w-2xl gap-6 px-6 py-16 text-center">
      <h2 className="font-serif text-3xl">Acara</h2>
      {items.map((e) => (
        <div key={e.label} className="grid gap-2 rounded-xl border p-6">
          <h3 className="text-xl font-semibold">{e.label}</h3>
          <p>{fmt(e.at)}</p>
          {view.venueName && <p className="text-sm">{view.venueName}</p>}
          {view.venueAddress && <p className="text-sm text-muted-foreground">{view.venueAddress}</p>}
          <a className="mx-auto mt-2 inline-block rounded-md border px-4 py-2 text-sm underline"
            href={googleCalendarUrl({ title: `${e.label} ${view.coupleTitle}`, startMs: e.at, endMs: e.at + 2 * 3600_000, details: view.coupleTitle, location: view.venueAddress })}
            target="_blank" rel="noreferrer">
            + Simpan ke Kalender
          </a>
        </div>
      ))}
    </section>
  );
}
