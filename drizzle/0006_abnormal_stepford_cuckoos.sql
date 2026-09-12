CREATE TABLE `sgk_incentive_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`age_min` integer,
	`age_max` integer,
	`gender` text,
	`requires_disability` integer DEFAULT false NOT NULL,
	`region` text,
	`estimated_amount` real,
	`estimated_rate_percent` real,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
