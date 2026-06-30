import type { InvitationView } from "@/lib/invitations/view-model";

export function Envelope({ view }: { view: InvitationView }) {
  if (!view.hasGift) return null;
  return (
    <section className="mx-auto grid max-w-md gap-3 px-6 py-12 text-center">
      <h2 className="font-serif text-3xl">Amplop Digital</h2>
      <p className="text-sm text-muted-foreground">Doa restu Anda adalah hadiah terindah. Jika ingin memberi tanda kasih:</p>
      <div className="grid gap-1 rounded-xl border p-6">
        <p className="text-lg font-semibold">{view.gift.bankName}</p>
        <p className="font-mono text-xl tracking-wider">{view.gift.accountNumber}</p>
        <p className="text-sm">a.n. {view.gift.accountHolder}</p>
      </div>
    </section>
  );
}
