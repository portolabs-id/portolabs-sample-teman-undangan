"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/server";
import { getInvitationForOwner, updateInvitation } from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";
import { notFound } from "next/navigation";

function num(v: FormDataEntryValue | null): number | null {
  if (!v || v === "") return null;
  const ms = Date.parse(String(v));
  return Number.isNaN(ms) ? null : ms;
}

export async function saveInvitationAction(id: string, formData: FormData) {
  const user = await requireUser();
  const existing = await getInvitationForOwner(user.id, id);
  if (!existing) notFound();

  const parsed = invitationInput.parse({
    template: formData.get("template") || "classic",
    groomName: String(formData.get("groomName") || ""),
    groomParents: String(formData.get("groomParents") || ""),
    brideName: String(formData.get("brideName") || ""),
    brideParents: String(formData.get("brideParents") || ""),
    akadAt: num(formData.get("akadAt")),
    resepsiAt: num(formData.get("resepsiAt")),
    venueName: String(formData.get("venueName") || ""),
    venueAddress: String(formData.get("venueAddress") || ""),
    mapsUrl: (formData.get("mapsUrl") || null) as string | null,
    giftBankName: (formData.get("giftBankName") || null) as string | null,
    giftAccountNumber: (formData.get("giftAccountNumber") || null) as string | null,
    giftAccountHolder: (formData.get("giftAccountHolder") || null) as string | null,
  });

  await updateInvitation(user.id, id, parsed);
  revalidatePath(`/builder/${id}`);
}
