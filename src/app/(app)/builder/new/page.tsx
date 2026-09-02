import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { createInvitation, listInvitations } from "@/lib/invitations/queries";
import { DRAFT_DEFAULTS } from "@/lib/invitations/schema";

// Entry point for people who have no invitation yet: they land straight on the
// wizard instead of an empty dashboard. Reusing an existing invitation keeps a
// refresh or a back navigation from piling up empty drafts.
export default async function NewInvitationPage() {
  const user = await requireUser();
  const [latest] = await listInvitations(user.id);
  if (latest) redirect(`/builder/${latest.id}`);

  const inv = await createInvitation(user.id, DRAFT_DEFAULTS);
  redirect(`/builder/${inv.id}`);
}
