CREATE TABLE `spread_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`bid` varchar(20) NOT NULL,
	`ask` varchar(20) NOT NULL,
	`spread` varchar(20) NOT NULL,
	`spreadPercent` varchar(20) NOT NULL,
	`lastPrice` varchar(20) NOT NULL,
	`volume` bigint,
	`marketCap` bigint,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `spread_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_spread_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`thresholdPercent` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_spread_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `spread_ticker_idx` ON `spread_history` (`ticker`);--> statement-breakpoint
CREATE INDEX `spread_recorded_at_idx` ON `spread_history` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `spread_ticker_time_idx` ON `spread_history` (`ticker`,`recordedAt`);--> statement-breakpoint
CREATE INDEX `alert_user_idx` ON `user_spread_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `alert_ticker_idx` ON `user_spread_alerts` (`ticker`);--> statement-breakpoint
CREATE INDEX `alert_active_idx` ON `user_spread_alerts` (`isActive`);