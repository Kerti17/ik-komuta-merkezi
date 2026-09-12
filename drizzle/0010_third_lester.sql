CREATE TABLE `trainings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`training_name` text NOT NULL,
	`training_field` text NOT NULL,
	`status` text DEFAULT 'tamamlanmadi' NOT NULL,
	`completed_date` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `trainings_employee_idx` ON `trainings` (`employee_id`);--> statement-breakpoint
ALTER TABLE `manager_notes` ADD `training_id` integer REFERENCES trainings(id);