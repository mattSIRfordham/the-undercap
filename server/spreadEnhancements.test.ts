import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

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

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1"
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("spread tracking enhancements", () => {
  describe("historical spread data", () => {
    it("getSpreadHistory should accept ticker and days parameters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketData.getSpreadHistory({
        ticker: "AAPL",
        days: 7
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("getSpreadStatistics should return statistics object", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketData.getSpreadStatistics({
        ticker: "AAPL",
        days: 30
      });

      // Result can be null if no data exists yet
      if (result !== null) {
        expect(result).toHaveProperty("ticker");
        expect(result).toHaveProperty("avgSpreadPercent");
        expect(result).toHaveProperty("minSpreadPercent");
        expect(result).toHaveProperty("maxSpreadPercent");
        expect(result).toHaveProperty("volatility");
      }
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("spread alerts", () => {
    it("should create alert for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.spreadAlerts.create({
        ticker: "TEST",
        thresholdPercent: 2.5
      });

      expect(result).toEqual({ success: true });
    });

    it("should list alerts for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.spreadAlerts.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject alert creation for unauthenticated user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.spreadAlerts.create({
          ticker: "TEST",
          thresholdPercent: 2.5
        })
      ).rejects.toThrow();
    });

    it("should validate threshold percent range", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Too low
      await expect(
        caller.spreadAlerts.create({
          ticker: "TEST",
          thresholdPercent: 0
        })
      ).rejects.toThrow();

      // Too high
      await expect(
        caller.spreadAlerts.create({
          ticker: "TEST",
          thresholdPercent: 101
        })
      ).rejects.toThrow();
    });
  });

  describe("small-cap ticker integration", () => {
    it("getDefaultWatchlist should return array of tickers", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketData.getDefaultWatchlist();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Should return small-cap tickers (fallback or from DB)
      result.forEach(ticker => {
        expect(typeof ticker).toBe("string");
        expect(ticker.length).toBeGreaterThan(0);
      });
    });
  });
});
