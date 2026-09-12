DROP TABLE `sgk_incentives`;--> statement-breakpoint
ALTER TABLE `employees` ADD `birth_date` text;--> statement-breakpoint
ALTER TABLE `employees` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `employees` ADD `is_retired` integer DEFAULT false NOT NULL;