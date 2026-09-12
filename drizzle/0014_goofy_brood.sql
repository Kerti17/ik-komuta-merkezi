CREATE TABLE `garnishments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`enforcement_office` text NOT NULL,
	`case_number` text NOT NULL,
	`total_debt` real NOT NULL,
	`monthly_deduction_amount` real NOT NULL,
	`deducted_amount` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `garnishments_employee_idx` ON `garnishments` (`employee_id`);