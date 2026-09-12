CREATE TABLE `career_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`record_type` text NOT NULL,
	`title` text,
	`effective_date` text,
	`target_title` text,
	`target_date` text,
	`development_note` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `career_records_employee_idx` ON `career_records` (`employee_id`);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `review_type` text DEFAULT 'ise_giris' NOT NULL;