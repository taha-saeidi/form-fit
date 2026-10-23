CREATE TABLE `plan_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`week` text NOT NULL,
	`profile` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `requests_user_idx` ON `plan_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `requests_status_idx` ON `plan_requests` (`status`);