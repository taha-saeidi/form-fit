CREATE TABLE `reviewed_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`user_id` text NOT NULL,
	`moves` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reviewed_plans_user_idx` ON `reviewed_plans` (`user_id`);