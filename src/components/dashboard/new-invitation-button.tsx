import { Plus } from "lucide-react";
import { createDraftAction } from "@/app/(app)/dashboard/actions";

export function NewInvitationButton() {
  return (
    <form action={createDraftAction}>
      <button type="submit" className="btn btn--solid">
        <Plus size={16} strokeWidth={2.6} style={{ marginRight: "0.4rem" }} />
        Undangan baru
      </button>
    </form>
  );
}
