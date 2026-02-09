import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1"
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("articles router", () => {
  it("getRecent should return articles array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.getRecent({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("getByCategory should accept valid category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.getByCategory({ 
      category: "market_analysis",
      limit: 5 
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("companies router", () => {
  it("getFeatured should return companies array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.companies.getFeatured();

    expect(Array.isArray(result)).toBe(true);
  });

  it("getAll should return companies with limit", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.companies.getAll({ limit: 20 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("polls router", () => {
  it("getActive should return null or poll object", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.polls.getActive();

    if (result !== null) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("question");
      expect(result).toHaveProperty("options");
      expect(result).toHaveProperty("voteCounts");
    }
  });
});

describe("newsletter router", () => {
  it("subscribe should validate email format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({ 
        email: "invalid-email",
        frequency: "weekly" 
      })
    ).rejects.toThrow();
  });

  it("subscribe should accept valid email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({ 
      email: "test@example.com",
      frequency: "weekly" 
    });

    expect(result).toHaveProperty("success");
  });
});
