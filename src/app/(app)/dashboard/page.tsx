import { requireUser } from "@/lib/auth/server";
import { listInvitations } from "@/lib/invitations/queries";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { NewInvitationButton } from "@/components/dashboard/new-invitation-button";

export default async function DashboardPage() {
  const user = await requireUser();
  const invitations = await listInvitations(user.id);
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Undangan Saya</h1>
        <NewInvitationButton />
      </div>
      {invitations.length === 0 ? (
        <p className="text-muted-foreground">Belum ada undangan. Klik &quot;Undangan baru&quot; untuk mulai.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {invitations.map((i) => (
            <InvitationCard key={i.id} inv={{ id: i.id, slug: i.slug, coupleTitle: `${i.groomName} & ${i.brideName}`, status: i.status }} />
          ))}
        </div>
      )}
    </div>
  );
}
