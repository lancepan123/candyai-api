CREATE TABLE `logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`level` enum('info','warn','error') NOT NULL DEFAULT 'info',
	`message` text NOT NULL,
	`meta` json,
	`user_id` bigint,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`description` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
ALTER TABLE `logs` ADD CONSTRAINT `logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;