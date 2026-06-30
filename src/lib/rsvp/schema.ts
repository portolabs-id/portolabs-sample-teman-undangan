import { z } from "zod";

export const rsvpInput = z.object({
  guestName: z.string().min(1).max(80),
  attendance: z.enum(["yes", "no", "maybe"]),
  headcount: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
});

export type RsvpInput = z.infer<typeof rsvpInput>;
