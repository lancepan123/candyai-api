CREATE TABLE `admin_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`admin_id` bigint,
	`action` varchar(255) NOT NULL,
	`details` json,
	`ip_address` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admins` ADD `status` enum('active','banned') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_logs` ADD CONSTRAINT `admin_logs_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;