import cron from 'node-cron'
import { updateMarketDataCache, cleanupOldCache } from './dataCache'

/**
 * Initialize all cron jobs for the application
 */
export function initializeCronJobs() {
  console.log('Initializing cron jobs...')

  // Update market data every 30 minutes
  // Runs at :00 and :30 of every hour
  cron.schedule('0,30 * * * *', async () => {
    console.log('Running scheduled market data update...')
    try {
      await updateMarketDataCache()
      console.log('✓ Market data updated successfully')
    } catch (error) {
      console.error('✗ Failed to update market data:', error)
    }
  })

  // Clean up old cache data daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('Running scheduled cache cleanup...')
    try {
      await cleanupOldCache()
      console.log('✓ Cache cleanup completed successfully')
    } catch (error) {
      console.error('✗ Failed to cleanup cache:', error)
    }
  })

  console.log('✓ Cron jobs initialized:')
  console.log('  - Market data update: Every 30 minutes')
  console.log('  - Cache cleanup: Daily at 3:00 AM')
}

/**
 * Manually trigger market data update
 */
export async function manualUpdateMarketData() {
  console.log('Manual market data update triggered')
  try {
    await updateMarketDataCache()
    console.log('✓ Market data updated successfully')
    return { success: true, message: 'Market data updated successfully' }
  } catch (error) {
    console.error('✗ Failed to update market data:', error)
    return { success: false, message: 'Failed to update market data', error: String(error) }
  }
}
