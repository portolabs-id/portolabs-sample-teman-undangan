import type { InvitationView } from "@/lib/invitations/view-model";
import { ClassicTemplate } from "./classic";

export type TemplateProps = { view: InvitationView; guest?: string; rsvpSlot?: React.ReactNode };

// floral and modern are added in Task 11; default to classic until then.
export const templateRegistry: Record<string, (props: TemplateProps) => React.ReactNode> = {
  classic: ClassicTemplate,
  floral: ClassicTemplate,
  modern: ClassicTemplate,
};

export function pickTemplate(name: string) {
  return templateRegistry[name] ?? ClassicTemplate;
}
