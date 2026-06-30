import type { InvitationView } from "@/lib/invitations/view-model";

function Card({ name, parents }: { name: string; parents: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h3 className="font-serif text-3xl">{name}</h3>
      {parents && <p className="text-sm text-muted-foreground">Putra/Putri dari<br />{parents}</p>}
    </div>
  );
}

export function Couple({ view }: { view: InvitationView }) {
  return (
    <section className="mx-auto grid max-w-2xl gap-10 px-6 py-16 sm:grid-cols-2">
      <Card name={view.groomName} parents={view.groomParents} />
      <Card name={view.brideName} parents={view.brideParents} />
    </section>
  );
}
