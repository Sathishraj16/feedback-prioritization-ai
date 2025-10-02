CREATE TABLE `clusters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`size` integer DEFAULT 0,
	`x_position` real,
	`y_position` real,
	`color` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`source` text NOT NULL,
	`customer_email` text,
	`customer_name` text,
	`cluster_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`cluster_id`) REFERENCES `clusters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `swarm_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feedback_id` integer NOT NULL,
	`agent_type` text NOT NULL,
	`score` real,
	`reasoning` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`feedback_id`) REFERENCES `feedback`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `top_priorities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feedback_id` integer NOT NULL,
	`rank` integer NOT NULL,
	`consensus_score` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`feedback_id`) REFERENCES `feedback`(`id`) ON UPDATE no action ON DELETE no action
);
