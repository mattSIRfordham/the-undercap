CREATE TABLE `user_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`authorName` varchar(100) NOT NULL,
	`authorEmail` varchar(320) NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` enum('market_analysis','company_news','regulatory','opinion') NOT NULL,
	`companyTickers` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`publishedArticleId` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `user_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `user_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `submitted_idx` ON `user_submissions` (`submittedAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_submissions` (`userId`);