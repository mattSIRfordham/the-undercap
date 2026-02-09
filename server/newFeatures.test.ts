import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(isAdmin = false): TrpcContext {
  const user = isAdmin ? {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } : undefined;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1"
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("stock screener", () => {
  it("search should return companies array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screener.search({
      minMarketCap: 1000000,
      maxMarketCap: 1000000000,
      limit: 10
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("getSectors should return array of sectors", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screener.getSectors();

    expect(Array.isArray(result)).toBe(true);
  });

  it("getStats should return statistics object", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.screener.getStats();

    if (result) {
      expect(result).toHaveProperty("totalCompanies");
    }
  });
});

describe("user submissions", () => {
  it("create should accept valid submission", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.create({
      authorName: "Test Author",
      authorEmail: "test@example.com",
      title: "Test Article About Small-Cap Stocks",
      content: "This is a test article with enough content to meet the minimum requirement of 100 characters for submission validation.",
      category: "market_analysis",
      companyTickers: ["AAPL", "MSFT"]
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("create should reject short content", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.submissions.create({
        authorName: "Test",
        authorEmail: "test@example.com",
        title: "Short",
        content: "Too short",
        category: "opinion"
      })
    ).rejects.toThrow();
  });

  it("getAll should require admin role", async () => {
    const ctx = createMockContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.submissions.getAll()
    ).rejects.toThrow();
  });

  it("getAll should work for admin", async () => {
    const ctx = createMockContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.submissions.getAll();

    expect(Array.isArray(result)).toBe(true);
  });
});
