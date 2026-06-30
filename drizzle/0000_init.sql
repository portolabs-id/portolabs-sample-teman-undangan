CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`template` text DEFAULT 'classic' NOT NULL,
	`groom_name` text DEFAULT '' NOT NULL,
	`groom_parents` text DEFAULT '' NOT NULL,
	`bride_name` text DEFAULT '' NOT NULL,
	`bride_parents` text DEFAULT '' NOT NULL,
	`akad_at` integer,
	`resepsi_at` integer,
	`venue_name` text DEFAULT '' NOT NULL,
	`venue_address` text DEFAULT '' NOT NULL,
	`maps_url` text,
	`gift_bank_name` text,
	`gift_account_number` text,
	`gift_account_holder` text,
	`gift_qris_key` text,
	`cover_photo_key` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`guest_name` text NOT NULL,
	`attendance` text NOT NULL,
	`headcount` integer DEFAULT 1 NOT NULL,
	`message` text,
	`created_at` integer NOT NULL
);
