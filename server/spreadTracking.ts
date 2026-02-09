/**
 * Spread Tracking Service for Historical Data
 */

import { getDb } from "./db";
import { spreadHistory, userSpreadAlerts, companies, users } from "../drizzle/schema";
import { fetchRealTimeQuote } from "./marketData";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Log current spread data for a ticker
 */
export async function logSpreadData(ticker: string): Promise<boolean> {
  try {
    const quote = await fetchRealTimeQuote(ticker);
    if (!quote) {
      return false;
    }

    const db = await getDb();
    if (!db) {
      return false;
    }

    await db.insert(spreadHistory).values({
      ticker: quote.ticker,
      bid: quote.bid.toString(),
      ask: quote.ask.toString(),
      spread: quote.spread.toString(),
      spreadPercent: quote.spreadPercent.toString(),
      lastPrice: quote.lastPrice.toString(),
      volume: quote.volume,
      marketCap: quote.marketCap,
      recordedAt: quote.timestamp,
    });

    return true;
  } catch (error) {
    console.error(`Error logging spread data for ${ticker}:`, error);
    return false;
  }
}

/**
 * Log spread data for multiple tickers
 */
export async function logMultipleSpreadData(tickers: string[]): Promise<number> {
  const results = await Promise.all(tickers.map(ticker => logSpreadData(ticker)));
  return results.filter(r => r).length;
}

/**
 * Get historical spread data for a ticker
 */
export async function getSpreadHistory(
  ticker: string,
  startDate: Date,
  endDate: Date = new Date()
) {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const history = await db
      .select()
      .from(spreadHistory)
      .where(
        and(
          eq(spreadHistory.ticker, ticker.toUpperCase()),
          gte(spreadHistory.recordedAt, startDate),
          sql`${spreadHistory.recordedAt} <= ${endDate}`
        )
      )
      .orderBy(desc(spreadHistory.recordedAt))
      .limit(1000)
      .execute();

    return history.map(h => ({
      ...h,
      bid: parseFloat(h.bid),
      ask: parseFloat(h.ask),
      spread: parseFloat(h.spread),
      spreadPercent: parseFloat(h.spreadPercent),
      lastPrice: parseFloat(h.lastPrice),
    }));
  } catch (error) {
    console.error(`Error fetching spread history for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get spread statistics over a time period
 */
export async function getSpreadStatistics(ticker: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await getSpreadHistory(ticker, startDate);

    if (history.length === 0) {
      return null;
    }

    const spreads = history.map(h => h.spreadPercent);
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    const minSpread = Math.min(...spreads);
    const maxSpread = Math.max(...spreads);
    
    // Calculate volatility (standard deviation)
    const variance = spreads.reduce((sum, spread) => {
      return sum + Math.pow(spread - avgSpread, 2);
    }, 0) / spreads.length;
    const volatility = Math.sqrt(variance);

    return {
      ticker,
      period: `${days} days`,
      dataPoints: history.length,
      avgSpreadPercent: avgSpread,
      minSpreadPercent: minSpread,
      maxSpreadPercent: maxSpread,
      volatility,
      startDate,
      endDate: new Date(),
    };
  } catch (error) {
    console.error(`Error calculating spread statistics for ${ticker}:`, error);
    return null;
  }
}

/**
 * Check alerts for a specific ticker and notify users if thresholds exceeded
 */
export async function checkSpreadAlerts(ticker: string, currentSpreadPercent: number) {
  try {
    const db = await getDb();
    if (!db) {
      return [];
    }

    // Find active alerts for this ticker where threshold is exceeded
    const alerts = await db
      .select()
      .from(userSpreadAlerts)
      .where(
        and(
          eq(userSpreadAlerts.ticker, ticker.toUpperCase()),
          eq(userSpreadAlerts.isActive, true),
          sql`CAST(${userSpreadAlerts.thresholdPercent} AS DECIMAL(10,4)) <= ${currentSpreadPercent}`
        )
      )
      .execute();

    // Update lastTriggeredAt and send notifications for triggered alerts
    const triggeredAlertIds = alerts.map(a => a.id);
    if (triggeredAlertIds.length > 0) {
      await db
        .update(userSpreadAlerts)
        .set({ lastTriggeredAt: new Date() })
        .where(sql`${userSpreadAlerts.id} IN (${triggeredAlertIds.join(',')})`)
        .execute();

      // Send notifications for each triggered alert
      for (const alert of alerts) {
        try {
          // Get user info for notification
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, alert.userId))
            .limit(1)
            .execute();

          const user = userResult[0];
          if (user) {
            await notifyOwner({
              title: `Spread Alert: ${ticker}`,
              content: `The bid-ask spread for ${ticker} has exceeded your threshold of ${alert.thresholdPercent}%. Current spread: ${currentSpreadPercent.toFixed(3)}%. User: ${user.name || user.email || user.openId}`
            });
            console.log(`[SpreadAlert] Notification sent for ${ticker} to user ${user.id}`);
          }
        } catch (error) {
          console.error(`[SpreadAlert] Failed to send notification for alert ${alert.id}:`, error);
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error(`Error checking spread alerts for ${ticker}:`, error);
    return [];
  }
}

/**
 * Background job to periodically log spread data for all tracked companies
 */
export async function runSpreadTrackingJob(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[SpreadTracking] Database not available");
      return;
    }

    // Get all companies with tickers
    const companiesWithTickers = await db
      .select({ ticker: companies.ticker })
      .from(companies)
      .where(sql`${companies.ticker} IS NOT NULL AND ${companies.ticker} != ''`)
      .limit(50) // Limit to avoid rate limiting
      .execute();

    const tickers = companiesWithTickers.map(c => c.ticker!);
    
    if (tickers.length === 0) {
      console.log("[SpreadTracking] No tickers to track");
      return;
    }

    console.log(`[SpreadTracking] Logging spread data for ${tickers.length} tickers`);
    
    // Log spread data and check alerts
    for (const ticker of tickers) {
      const quote = await fetchRealTimeQuote(ticker);
      if (quote) {
        await logSpreadData(ticker);
        const triggeredAlerts = await checkSpreadAlerts(ticker, quote.spreadPercent);
        
        if (triggeredAlerts.length > 0) {
          console.log(`[SpreadTracking] ${triggeredAlerts.length} alerts triggered for ${ticker}`);
          // TODO: Send notifications to users
        }
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log("[SpreadTracking] Job completed successfully");
  } catch (error) {
    console.error("[SpreadTracking] Job failed:", error);
  }
}
