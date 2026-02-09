import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies table for tracking small-cap companies
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  exchange: mysqlEnum("exchange", ["NASDAQ", "NYSE", "OTC"]).notNull(),
  marketCap: bigint("marketCap", { mode: "number" }), // in USD
  floatShares: bigint("floatShares", { mode: "number" }), // shares available for trading
  sharesOutstanding: bigint("sharesOutstanding", { mode: "number" }),
  currentPrice: varchar("currentPrice", { length: 20 }), // stored as string to avoid decimal precision issues
  volume: bigint("volume", { mode: "number" }), // average daily volume
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  description: text("description"),
  logoUrl: text("logoUrl"),
  websiteUrl: text("websiteUrl"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  featuredOrder: int("featuredOrder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tickerIdx: index("ticker_idx").on(table.ticker),
  featuredIdx: index("featured_idx").on(table.isFeatured),
}));

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Articles table for AI-generated news content
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("imageUrl"),
  authorName: varchar("authorName", { length: 100 }).default("The Undercap").notNull(),
  category: mysqlEnum("category", ["market_analysis", "company_news", "regulatory", "opinion", "featured"]).default("market_analysis").notNull(),
  tags: text("tags"), // JSON array of tags
  viewCount: int("viewCount").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  publishedIdx: index("published_idx").on(table.isPublished, table.publishedAt),
  categoryIdx: index("category_idx").on(table.category),
}));

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Article-Company relationship (many-to-many)
 */
export const articleCompanies = mysqlTable("article_companies", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  companyId: int("companyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  articleIdx: index("article_idx").on(table.articleId),
  companyIdx: index("company_idx").on(table.companyId),
}));

export type ArticleCompany = typeof articleCompanies.$inferSelect;
export type InsertArticleCompany = typeof articleCompanies.$inferInsert;

/**
 * Comments on articles
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("isApproved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  articleIdx: index("article_idx").on(table.articleId),
  userIdx: index("user_idx").on(table.userId),
}));

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Polls for topical issues
 */
export const polls = mysqlTable("polls", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array of options
  initialVotes: text("initialVotes").notNull(), // JSON array of randomized initial vote counts
  articleId: int("articleId"), // Optional: associate with article
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  articleIdx: index("article_idx").on(table.articleId),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = typeof polls.$inferInsert;

/**
 * Poll votes from users
 */
export const pollVotes = mysqlTable("poll_votes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("pollId").notNull(),
  userId: int("userId"), // Nullable for anonymous votes
  optionIndex: int("optionIndex").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // For preventing duplicate anonymous votes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  pollIdx: index("poll_idx").on(table.pollId),
  userIdx: index("user_idx").on(table.userId),
}));

export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = typeof pollVotes.$inferInsert;

/**
 * Newsletter subscribers
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  userId: int("userId"), // Optional: link to user account
  isActive: boolean("isActive").default(true).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).default("weekly").notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * Company Q&A entries for IR clients
 */
export const companyQA = mysqlTable("company_qa", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  askedBy: varchar("askedBy", { length: 100 }),
  answeredBy: varchar("answeredBy", { length: 100 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdx: index("company_idx").on(table.companyId),
  publishedIdx: index("published_idx").on(table.isPublished),
}));

export type CompanyQA = typeof companyQA.$inferSelect;
export type InsertCompanyQA = typeof companyQA.$inferInsert;

/**
 * Content generation log for tracking AI article creation
 */
export const contentGenerationLog = mysqlTable("content_generation_log", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId"),
  status: mysqlEnum("status", ["success", "failed", "skipped"]).notNull(),
  errorMessage: text("errorMessage"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  generatedIdx: index("generated_idx").on(table.generatedAt),
}));

export type ContentGenerationLog = typeof contentGenerationLog.$inferSelect;
export type InsertContentGenerationLog = typeof contentGenerationLog.$inferInsert;

/**
 * User-submitted content for review and publication
 */
export const userSubmissions = mysqlTable("user_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  authorName: varchar("authorName", { length: 100 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["market_analysis", "company_news", "regulatory", "opinion"]).notNull(),
  companyTickers: text("companyTickers"), // JSON array of tickers
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"), // admin user ID
  reviewNotes: text("reviewNotes"),
  publishedArticleId: int("publishedArticleId"), // link to published article if approved
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  submittedIdx: index("submitted_idx").on(table.submittedAt),
  userIdx: index("user_idx").on(table.userId),
}));

export type UserSubmission = typeof userSubmissions.$inferSelect;
export type InsertUserSubmission = typeof userSubmissions.$inferInsert;

/**
 * Historical spread data for tracking bid-ask spreads over time
 */
export const spreadHistory = mysqlTable("spread_history", {
  id: int("id").autoincrement().primaryKey(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  bid: varchar("bid", { length: 50 }).notNull(), // stored as string for precision
  ask: varchar("ask", { length: 50 }).notNull(),
  spread: varchar("spread", { length: 50 }).notNull(),
  spreadPercent: varchar("spreadPercent", { length: 50 }).notNull(),
  lastPrice: varchar("lastPrice", { length: 50 }).notNull(),
  volume: bigint("volume", { mode: "number" }),
  marketCap: bigint("marketCap", { mode: "number" }),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  tickerIdx: index("spread_ticker_idx").on(table.ticker),
  recordedAtIdx: index("spread_recorded_at_idx").on(table.recordedAt),
  tickerTimeIdx: index("spread_ticker_time_idx").on(table.ticker, table.recordedAt),
}));

export type SpreadHistory = typeof spreadHistory.$inferSelect;
export type InsertSpreadHistory = typeof spreadHistory.$inferInsert;

/**
 * User spread alerts for monitoring specific tickers
 */
export const userSpreadAlerts = mysqlTable("user_spread_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  thresholdPercent: varchar("thresholdPercent", { length: 10 }).notNull(), // alert when spread exceeds this %
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("alert_user_idx").on(table.userId),
  tickerIdx: index("alert_ticker_idx").on(table.ticker),
  activeIdx: index("alert_active_idx").on(table.isActive),
}));

export type UserSpreadAlert = typeof userSpreadAlerts.$inferSelect;
export type InsertUserSpreadAlert = typeof userSpreadAlerts.$inferInsert;
