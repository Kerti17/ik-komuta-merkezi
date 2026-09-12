CREATE TABLE `collective_agreements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`union_name` text NOT NULL,
	`agreement_start_date` text NOT NULL,
	`agreement_end_date` text NOT NULL,
	`covered_employee_count` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `collective_agreement_warning_days` integer DEFAULT 90 NOT NULL;