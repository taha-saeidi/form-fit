CREATE TABLE `session_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`day` text NOT NULL,
	`difficulty` integer NOT NULL,
	`pain` integer NOT NULL,
	`notes` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_user_date_idx` ON `session_feedback` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`day` text NOT NULL,
	`date` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` text NOT NULL,
	`reps` integer NOT NULL,
	`effort` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `set_logs_user_date_idx` ON `set_logs` (`user_id`,`date`);