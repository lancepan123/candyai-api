ALTER TABLE `ai_models` MODIFY COLUMN `provider` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_models` MODIFY COLUMN `api_url` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_models` MODIFY COLUMN `api_key` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_models` MODIFY COLUMN `token_limit` int NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_models` DROP COLUMN `token_usage`;