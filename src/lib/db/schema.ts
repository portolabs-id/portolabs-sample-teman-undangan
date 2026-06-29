import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// NOTE: auth.schema is generated in Task 3; until then this re-export is empty.
export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull().unique(),
  template: text("template").notNull().default("classic"),
  groomName: text("groom_name").notNull().default(""),
  groomParents: text("groom_parents").notNull().default(""),
  brideName: text("bride_name").notNull().default(""),
  brideParents: text("bride_parents").notNull().default(""),
  akadAt: integer("akad_at"),
  resepsiAt: integer("resepsi_at"),
  venueName: text("venue_name").notNull().default(""),
  venueAddress: text("venue_address").notNull().default(""),
  mapsUrl: text("maps_url"),
  giftBankName: text("gift_bank_name"),
  giftAccountNumber: text("gift_account_number"),
  giftAccountHolder: text("gift_account_holder"),
  giftQrisKey: text("gift_qris_key"),
  coverPhotoKey: text("cover_photo_key"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  invitationId: text("invitation_id").notNull(),
  r2Key: text("r2_key").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const rsvps = sqliteTable("rsvps", {
  id: text("id").primaryKey(),
  invitationId: text("invitation_id").notNull(),
  guestName: text("guest_name").notNull(),
  attendance: text("attendance", { enum: ["yes", "no", "maybe"] }).notNull(),
  headcount: integer("headcount").notNull().default(1),
  message: text("message"),
  createdAt: integer("created_at").notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;
