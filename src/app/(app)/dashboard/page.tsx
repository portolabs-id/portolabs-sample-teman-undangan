import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { listInvitations } from "@/lib/invitations/queries";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { NewInvitationButton } from "@/components/dashboard/new-invitation-button";

export default async function DashboardPage() {
  const user = await requireUser();
  const invitations = await listInvitations(user.id);
  // Nothing to list yet: send first-timers straight into the wizard.
  if (invitations.length === 0) redirect("/builder/new");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Undangan Saya</h1>
        <NewInvitationButton />
      </div>
      <div className="inv-grid">
        {invitations.map((i) => (
          <InvitationCard key={i.id} inv={{ id: i.id, slug: i.slug, coupleTitle: `${i.groomName} & ${i.brideName}`, status: i.status }} />
        ))}
      </div>
    </>
  );
}
