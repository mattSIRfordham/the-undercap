import { generateHourlyContent } from './contentGenerator';

/**
 * Cron job runner for automated content generation
 * This module exports functions that can be called by external schedulers
 */

/**
 * Run hourly content generation
 * Should be called every hour by the scheduler
 */
export async function runHourlyContentGeneration() {
  console.log(`[CronJob] Starting hourly content generation at ${new Date().toISOString()}`);
  
  try {
    await generateHourlyContent();
    console.log(`[CronJob] Hourly content generation completed successfully`);
    return { success: true };
  } catch (error) {
    console.error(`[CronJob] Hourly content generation failed:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Initialize cron jobs
 * This function sets up the schedule for automated tasks
 */
export function initializeCronJobs() {
  console.log('[CronJob] Cron jobs initialized - use external scheduler to trigger runHourlyContentGeneration()');
  
  // Note: Actual scheduling will be done via Manus schedule API
  // This is just a placeholder for the cron job infrastructure
}
