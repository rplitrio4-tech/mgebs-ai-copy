CREATE TABLE `marketplace_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(128) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`visibility` enum('private','public') NOT NULL DEFAULT 'private',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewerNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(128) NOT NULL,
	`messagesJson` text NOT NULL,
	`memoryJson` text NOT NULL,
	`skillsJson` text NOT NULL,
	`secretsJson` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_states_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_states_visitorId_unique` UNIQUE(`visitorId`)
);
