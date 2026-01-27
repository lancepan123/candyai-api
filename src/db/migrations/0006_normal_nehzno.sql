CREATE TABLE `ai_models` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`api_url` varchar(512) NOT NULL,
	`api_key` varchar(512) NOT NULL,
	`token_usage` bigint NOT NULL DEFAULT 0,
	`token_limit` bigint NOT NULL,
	`status` enum('active','inactive','error') NOT NULL DEFAULT 'active',
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_models_id` PRIMARY KEY(`id`)
);
