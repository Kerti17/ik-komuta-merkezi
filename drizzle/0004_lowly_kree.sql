CREATE TABLE `risk_score_weights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attendance_trend_weight` real DEFAULT 30 NOT NULL,
	`overtime_load_weight` real DEFAULT 20 NOT NULL,
	`disciplinary_count_weight` real DEFAULT 20 NOT NULL,
	`low_seniority_weight` real DEFAULT 15 NOT NULL,
	`accrued_leave_weight` real DEFAULT 15 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
