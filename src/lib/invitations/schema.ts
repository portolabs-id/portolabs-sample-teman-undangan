import { z } from "zod";

export const TEMPLATES = ["classic", "floral", "modern"] as const;

export const invitationInput = z.object({
  template: z.enum(TEMPLATES).default("classic"),
  groomName: z.string().min(1).max(80),
  groomParents: z.string().max(200).default(""),
  brideName: z.string().min(1).max(80),
  brideParents: z.string().max(200).default(""),
  akadAt: z.number().int().nullable().default(null),
  resepsiAt: z.number().int().nullable().default(null),
  venueName: z.string().max(160).default(""),
  venueAddress: z.string().max(400).default(""),
  mapsUrl: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), "URL harus diawali http:// atau https://")
    .nullable()
    .default(null),
  giftBankName: z.string().max(80).nullable().default(null),
  giftAccountNumber: z.string().max(60).nullable().default(null),
  giftAccountHolder: z.string().max(120).nullable().default(null),
});

export type InvitationInput = z.infer<typeof invitationInput>;

export const DRAFT_DEFAULTS: InvitationInput = invitationInput.parse({
  groomName: "Mempelai Pria",
  brideName: "Mempelai Wanita",
  template: "classic",
});
