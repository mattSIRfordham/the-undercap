CREATE TABLE `article_companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`companyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`imageUrl` text,
	`authorName` varchar(100) NOT NULL DEFAULT 'SmallCap News AI',
	`category` enum('market_analysis','company_news','regulatory','opinion','featured') NOT NULL DEFAULT 'market_analysis',
	`tags` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`isApproved` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`name` text NOT NULL,
	`exchange` enum('NASDAQ','NYSE','OTC') NOT NULL,
	`marketCap` bigint,
	`sector` varchar(100),
	`industry` varchar(100),
	`description` text,
	`logoUrl` text,
	`websiteUrl` text,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`featuredOrder` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
CREATE TABLE `company_qa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`askedBy` varchar(100),
	`answeredBy` varchar(100),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_qa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_generation_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int,
	`status` enum('success','failed','skipped') NOT NULL,
	`errorMessage` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_generation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`frequency` enum('daily','weekly','monthly') NOT NULL DEFAULT 'weekly',
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`unsubscribedAt` timestamp,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollId` int NOT NULL,
	`userId` int,
	`optionIndex` int NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poll_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`initialVotes` text NOT NULL,
	`articleId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `article_idx` ON `article_companies` (`articleId`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `article_companies` (`companyId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `published_idx` ON `articles` (`isPublished`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE INDEX `article_idx` ON `comments` (`articleId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `ticker_idx` ON `companies` (`ticker`);--> statement-breakpoint
CREATE INDEX `featured_idx` ON `companies` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `company_idx` ON `company_qa` (`companyId`);--> statement-breakpoint
CREATE INDEX `published_idx` ON `company_qa` (`isPublished`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `content_generation_log` (`status`);--> statement-breakpoint
CREATE INDEX `generated_idx` ON `content_generation_log` (`generatedAt`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `newsletter_subscribers` (`isActive`);--> statement-breakpoint
CREATE INDEX `poll_idx` ON `poll_votes` (`pollId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `poll_votes` (`userId`);--> statement-breakpoint
CREATE INDEX `article_idx` ON `polls` (`articleId`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `polls` (`isActive`);