import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { listRsvps } from "@/lib/rsvp/actions";

export default async function RsvpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const entries = await listRsvps(user.id, id);
  const attending = entries.filter((e) => e.attendance === "yes").reduce((s, e) => s + e.headcount, 0);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar RSVP</h1>
        <Link className="text-sm underline" href={`/builder/${id}`}>Kembali</Link>
      </div>
      <p className="text-sm text-muted-foreground">Total konfirmasi hadir: <strong>{attending}</strong> orang · {entries.length} respons</p>
      <div className="grid gap-2">
        {entries.map((e) => (
          <div key={e.id} className="rounded-md border p-3 text-sm">
            <strong>{e.guestName}</strong> — {e.attendance === "yes" ? "Hadir" : e.attendance === "no" ? "Tidak" : "Mungkin"} ({e.headcount})
            {e.message && <p className="text-muted-foreground">{e.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
