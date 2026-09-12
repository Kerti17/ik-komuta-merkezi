CREATE TABLE `licenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_key` text NOT NULL,
	`customer_name` text NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL,
	`activated_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `licenses_key_idx` ON `licenses` (`license_key`);