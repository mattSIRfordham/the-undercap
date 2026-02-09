/**
 * Cron Job Scheduler for Background Tasks
 * Runs spread tracking and other automated jobs
 */

import { runSpreadTrackingJob } from "./spreadTracking";

// Track running jobs to prevent overlaps
let isSpreadTrackingRunning = false;

/**
 * Spread tracking job wrapper with overlap prevention
 */
async function spreadTrackingJobWrapper() {
  if (isSpreadTrackingRunning) {
    console.log("[Scheduler] Spread tracking job already running, skipping...");
    return;
  }

  try {
    isSpreadTrackingRunning = true;
    console.log("[Scheduler] Starting spread tracking job...");
    await runSpreadTrackingJob();
    console.log("[Scheduler] Spread tracking job completed");
  } catch (error) {
    console.error("[Scheduler] Spread tracking job failed:", error);
  } finally {
    isSpreadTrackingRunning = false;
  }
}

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduler() {
  // Run spread tracking every 20 minutes
  const SPREAD_TRACKING_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds

  console.log("[Scheduler] Initializing spread tracking job (every 20 minutes)");
  
  // Run immediately on startup
  spreadTrackingJobWrapper();
  
  // Then run every 20 minutes
  setInterval(spreadTrackingJobWrapper, SPREAD_TRACKING_INTERVAL);

  console.log("[Scheduler] All jobs initialized successfully");
}

/**
 * Manually trigger spread tracking job (for testing or admin use)
 */
export async function triggerSpreadTracking() {
  await spreadTrackingJobWrapper();
  return { success: true, message: "Spread tracking job triggered" };
}
