import { submitRsvpAction } from "@/lib/rsvp/actions";

type Entry = { id: string; guestName: string; attendance: "yes" | "no" | "maybe"; message: string | null };

export function Rsvp({ invitationId, guest, entries }: { invitationId: string; guest?: string; entries: Entry[] }) {
  return (
    <section className="mx-auto grid max-w-md gap-6 px-6 py-16">
      <h2 className="text-center font-serif text-3xl">Konfirmasi & Ucapan</h2>
      <form action={submitRsvpAction.bind(null, invitationId)} className="grid gap-3">
        <input name="guestName" defaultValue={guest ?? ""} placeholder="Nama" required className="rounded-md border p-2" />
        <select name="attendance" className="rounded-md border p-2" defaultValue="yes">
          <option value="yes">Hadir</option>
          <option value="maybe">Mungkin</option>
          <option value="no">Tidak hadir</option>
        </select>
        <input name="headcount" type="number" min={1} max={20} defaultValue={1} className="rounded-md border p-2" />
        <textarea name="message" placeholder="Ucapan & doa" className="rounded-md border p-2" rows={3} />
        <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Kirim</button>
      </form>

      <div className="grid gap-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-lg border p-3">
            <p className="font-semibold">{e.guestName} <span className="text-xs text-muted-foreground">· {e.attendance === "yes" ? "Hadir" : e.attendance === "no" ? "Tidak hadir" : "Mungkin"}</span></p>
            {e.message && <p className="text-sm">{e.message}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
