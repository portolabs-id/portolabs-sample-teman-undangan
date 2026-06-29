import { Countdown } from "../countdown";
import type { InvitationView } from "@/lib/invitations/view-model";

export function Hero({ view, guest }: { view: InvitationView; guest?: string }) {
  const target = view.akadAt ?? view.resepsiAt;
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-cover bg-center px-6 text-center"
      style={view.coverUrl ? { backgroundImage: `url(${view.coverUrl})` } : undefined}>
      <div className="absolute inset-0 bg-white/70" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <p className="tracking-[0.3em] uppercase text-sm">The Wedding Of</p>
        <h1 className="font-serif text-5xl">{view.coupleTitle}</h1>
        {guest && <p className="text-sm">Kepada Yth. <strong>{guest}</strong></p>}
        {target && <Countdown targetMs={target} />}
      </div>
    </section>
  );
}
