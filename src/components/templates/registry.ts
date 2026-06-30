import type { InvitationView } from "@/lib/invitations/view-model";
import { ClassicTemplate } from "./classic";
import { FloralTemplate } from "./floral";
import { ModernTemplate } from "./modern";

export type TemplateProps = { view: InvitationView; guest?: string; rsvpSlot?: React.ReactNode };

export const templateRegistry: Record<string, (props: TemplateProps) => React.ReactNode> = {
  classic: ClassicTemplate,
  floral: FloralTemplate,
  modern: ModernTemplate,
};

export function pickTemplate(name: string) {
  return templateRegistry[name] ?? ClassicTemplate;
}
