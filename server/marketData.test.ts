import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
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

describe("market data API", () => {
  it("getDefaultWatchlist should return array of tickers", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marketData.getDefaultWatchlist();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("getQuote should accept ticker input", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test with a valid ticker - may return null if API fails, but should not throw
    const result = await caller.marketData.getQuote({ ticker: "AAPL" });

    // Result can be null if API is unavailable, but should be object or null
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("getMultipleQuotes should accept array of tickers", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marketData.getMultipleQuotes({
      tickers: ["AAPL", "MSFT"]
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("getSpreadStats should return statistics object", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marketData.getSpreadStats({
      tickers: ["AAPL"]
    });

    expect(result).toHaveProperty("avgSpread");
    expect(result).toHaveProperty("avgSpreadPercent");
    expect(result).toHaveProperty("minSpread");
    expect(result).toHaveProperty("maxSpread");
    expect(result).toHaveProperty("totalVolume");
  });
});
