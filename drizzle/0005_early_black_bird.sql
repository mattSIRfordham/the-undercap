ALTER TABLE `spread_history` MODIFY COLUMN `bid` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `spread_history` MODIFY COLUMN `ask` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `spread_history` MODIFY COLUMN `spread` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `spread_history` MODIFY COLUMN `spreadPercent` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `spread_history` MODIFY COLUMN `lastPrice` varchar(50) NOT NULL;