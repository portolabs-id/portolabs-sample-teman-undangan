import { Button } from "@/components/ui/button";
import { createDraftAction } from "@/app/(app)/dashboard/actions";

export function NewInvitationButton() {
  return (
    <form action={createDraftAction}>
      <Button type="submit">+ Undangan baru</Button>
    </form>
  );
}
