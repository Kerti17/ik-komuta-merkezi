CREATE TABLE `kvkk_inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`data_category` text NOT NULL,
	`processing_purpose` text NOT NULL,
	`legal_basis` text NOT NULL,
	`retention_period` text NOT NULL,
	`transferred_party` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
