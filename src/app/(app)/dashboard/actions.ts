"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { createInvitation, setStatus } from "@/lib/invitations/queries";
import { DRAFT_DEFAULTS } from "@/lib/invitations/schema";

export async function createDraftAction() {
  const user = await requireUser();
  const inv = await createInvitation(user.id, DRAFT_DEFAULTS);
  redirect(`/builder/${inv.id}`);
}

export async function setInvitationStatusAction(id: string, next: "draft" | "published") {
  const user = await requireUser();
  await setStatus(user.id, id, next);
  revalidatePath("/dashboard");
  revalidatePath(`/builder/${id}`);
}
