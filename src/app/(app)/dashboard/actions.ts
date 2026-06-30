"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { createInvitation, setStatus } from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";

export async function createDraftAction() {
  const user = await requireUser();
  const input = invitationInput.parse({ groomName: "Mempelai Pria", brideName: "Mempelai Wanita", template: "classic" });
  const inv = await createInvitation(user.id, input);
  redirect(`/builder/${inv.id}`);
}

export async function togglePublishAction(id: string, next: "draft" | "published") {
  const user = await requireUser();
  await setStatus(user.id, id, next);
  revalidatePath("/dashboard");
}
