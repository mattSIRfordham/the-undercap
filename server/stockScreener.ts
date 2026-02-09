import { and, eq, gte, lte, sql, or } from "drizzle-orm";
import { companies } from "../drizzle/schema";
import { getDb } from "./db";

export interface StockScreenerFilters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minFloat?: number;
  maxFloat?: number;
  sectors?: string[];
  exchanges?: ("NASDAQ" | "NYSE" | "OTC")[];
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  sortBy?: "marketCap" | "ticker" | "price" | "volume" | "float";
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export async function screenStocks(filters: StockScreenerFilters) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  // Market cap filter
  if (filters.minMarketCap !== undefined) {
    conditions.push(gte(companies.marketCap, filters.minMarketCap));
  }
  if (filters.maxMarketCap !== undefined) {
    conditions.push(lte(companies.marketCap, filters.maxMarketCap));
  }

  // Float filter
  if (filters.minFloat !== undefined) {
    conditions.push(gte(companies.floatShares, filters.minFloat));
  }
  if (filters.maxFloat !== undefined) {
    conditions.push(lte(companies.floatShares, filters.maxFloat));
  }

  // Sector filter
  if (filters.sectors && filters.sectors.length > 0) {
    const sectorConditions = filters.sectors.map(sector => 
      eq(companies.sector, sector)
    );
    conditions.push(or(...sectorConditions));
  }

  // Exchange filter
  if (filters.exchanges && filters.exchanges.length > 0) {
    const exchangeConditions = filters.exchanges.map(exchange => 
      eq(companies.exchange, exchange)
    );
    conditions.push(or(...exchangeConditions));
  }

  // Price filter (stored as string, need to cast)
  if (filters.minPrice !== undefined) {
    conditions.push(sql`CAST(${companies.currentPrice} AS DECIMAL(10,2)) >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(sql`CAST(${companies.currentPrice} AS DECIMAL(10,2)) <= ${filters.maxPrice}`);
  }

  // Volume filter
  if (filters.minVolume !== undefined) {
    conditions.push(gte(companies.volume, filters.minVolume));
  }

  let query = db.select().from(companies);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Sorting
  const sortBy = filters.sortBy || "marketCap";
  const sortOrder = filters.sortOrder || "desc";
  
  const sortColumn = {
    marketCap: companies.marketCap,
    ticker: companies.ticker,
    price: companies.currentPrice,
    volume: companies.volume,
    float: companies.floatShares
  }[sortBy];

  if (sortOrder === "desc") {
    query = query.orderBy(sql`${sortColumn} DESC`) as any;
  } else {
    query = query.orderBy(sql`${sortColumn} ASC`) as any;
  }

  // Limit
  const limit = filters.limit || 100;
  query = query.limit(limit) as any;

  return await query;
}

export async function getUniqueSectors() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ sector: companies.sector })
    .from(companies)
    .where(sql`${companies.sector} IS NOT NULL`);

  return result.map(r => r.sector).filter(Boolean) as string[];
}

export async function getScreenerStats() {
  const db = await getDb();
  if (!db) return null;

  const stats = await db
    .select({
      totalCompanies: sql<number>`COUNT(*)`,
      avgMarketCap: sql<number>`AVG(${companies.marketCap})`,
      minMarketCap: sql<number>`MIN(${companies.marketCap})`,
      maxMarketCap: sql<number>`MAX(${companies.marketCap})`,
      nasdaqCount: sql<number>`SUM(CASE WHEN ${companies.exchange} = 'NASDAQ' THEN 1 ELSE 0 END)`,
      nyseCount: sql<number>`SUM(CASE WHEN ${companies.exchange} = 'NYSE' THEN 1 ELSE 0 END)`,
      otcCount: sql<number>`SUM(CASE WHEN ${companies.exchange} = 'OTC' THEN 1 ELSE 0 END)`,
    })
    .from(companies);

  return stats[0];
}
