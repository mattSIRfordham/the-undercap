import { eq, desc } from "drizzle-orm";
import { userSubmissions, InsertUserSubmission } from "../drizzle/schema";
import { getDb } from "./db";

export async function createSubmission(submission: InsertUserSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userSubmissions).values(submission);
  return { success: true, id: Number(result[0].insertId) };
}

export async function getSubmissionsByStatus(status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.status, status))
    .orderBy(desc(userSubmissions.submittedAt));
}

export async function getAllSubmissions(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userSubmissions)
    .orderBy(desc(userSubmissions.submittedAt))
    .limit(limit);
}

export async function getSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateSubmissionStatus(
  id: number,
  status: "approved" | "rejected",
  reviewedBy: number,
  reviewNotes?: string,
  publishedArticleId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubmissions)
    .set({
      status,
      reviewedBy,
      reviewNotes,
      publishedArticleId,
      reviewedAt: new Date(),
    })
    .where(eq(userSubmissions.id, id));

  return { success: true };
}

export async function getUserSubmissions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.userId, userId))
    .orderBy(desc(userSubmissions.submittedAt));
}
