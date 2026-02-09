import { eq, desc, and, sql, inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  companies, Company, InsertCompany,
  articles, Article, InsertArticle,
  articleCompanies, InsertArticleCompany,
  comments, Comment, InsertComment,
  polls, Poll, InsertPoll,
  pollVotes, PollVote, InsertPollVote,
  newsletterSubscribers, NewsletterSubscriber, InsertNewsletterSubscriber,
  companyQA, CompanyQA, InsertCompanyQA,
  contentGenerationLog, ContentGenerationLog, InsertContentGenerationLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ COMPANY FUNCTIONS ============

export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(companies).values(company);
  return result;
}

export async function getCompanyByTicker(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(companies).where(eq(companies.ticker, ticker)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedCompanies() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(companies)
    .where(eq(companies.isFeatured, true))
    .orderBy(companies.featuredOrder);
}

export async function getAllCompanies(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(companies).limit(limit);
}

export async function updateCompanyMarketCap(ticker: string, marketCap: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(companies)
    .set({ marketCap, updatedAt: new Date() })
    .where(eq(companies.ticker, ticker));
}

// ============ ARTICLE FUNCTIONS ============

export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(articles).values(article);
  return result;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRecentArticles(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getArticlesByCategory(category: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(articles)
    .where(and(
      eq(articles.isPublished, true),
      eq(articles.category, category as any)
    ))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function incrementArticleViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, id));
}

// ============ ARTICLE-COMPANY RELATIONSHIP ============

export async function linkArticleToCompany(articleId: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(articleCompanies).values({ articleId, companyId });
}

export async function getArticleCompanies(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({ company: companies })
    .from(articleCompanies)
    .innerJoin(companies, eq(articleCompanies.companyId, companies.id))
    .where(eq(articleCompanies.articleId, articleId));
  
  return result.map(r => r.company);
}

export async function getCompanyArticles(companyId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({ article: articles })
    .from(articleCompanies)
    .innerJoin(articles, eq(articleCompanies.articleId, articles.id))
    .where(and(
      eq(articleCompanies.companyId, companyId),
      eq(articles.isPublished, true)
    ))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  
  return result.map(r => r.article);
}

// ============ COMMENT FUNCTIONS ============

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(comments).values(comment);
  return result;
}

export async function getArticleComments(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    comment: comments,
    user: users
  })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(
      eq(comments.articleId, articleId),
      eq(comments.isApproved, true)
    ))
    .orderBy(desc(comments.createdAt));
  
  return result;
}

// ============ POLL FUNCTIONS ============

export async function createPoll(poll: InsertPoll) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(polls).values(poll);
  return result;
}

export async function getPollById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(polls).where(eq(polls.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActivePoll() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(polls)
    .where(eq(polls.isActive, true))
    .orderBy(desc(polls.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getPollVotes(pollId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pollVotes).where(eq(pollVotes.pollId, pollId));
}

export async function createPollVote(vote: InsertPollVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(pollVotes).values(vote);
  return result;
}

export async function hasUserVoted(pollId: number, userId?: number, ipAddress?: string) {
  const db = await getDb();
  if (!db) return false;
  
  const conditions = [eq(pollVotes.pollId, pollId)];
  
  if (userId) {
    conditions.push(eq(pollVotes.userId, userId));
  } else if (ipAddress) {
    conditions.push(eq(pollVotes.ipAddress, ipAddress));
  } else {
    return false;
  }
  
  const result = await db.select().from(pollVotes)
    .where(and(...conditions))
    .limit(1);
  
  return result.length > 0;
}

// ============ NEWSLETTER FUNCTIONS ============

export async function subscribeNewsletter(subscriber: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(newsletterSubscribers).values(subscriber)
    .onDuplicateKeyUpdate({
      set: { isActive: true, subscribedAt: new Date() }
    });
  return { success: true };
}

export async function unsubscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(newsletterSubscribers)
    .set({ isActive: false, unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.email, email));
}

export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true));
}

// ============ COMPANY Q&A FUNCTIONS ============

export async function createCompanyQA(qa: InsertCompanyQA) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(companyQA).values(qa);
  return result;
}

export async function getCompanyQAs(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(companyQA)
    .where(and(
      eq(companyQA.companyId, companyId),
      eq(companyQA.isPublished, true)
    ))
    .orderBy(companyQA.displayOrder);
}

// ============ CONTENT GENERATION LOG ============

export async function logContentGeneration(log: InsertContentGenerationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contentGenerationLog).values(log);
  return result;
}

export async function getRecentGenerationLogs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contentGenerationLog)
    .orderBy(desc(contentGenerationLog.generatedAt))
    .limit(limit);
}
