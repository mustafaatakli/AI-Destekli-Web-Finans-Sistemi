import cron from 'node-cron'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

console.log('🚀 FinAlert Cron Service Started')
console.log(`📡 API URL: ${API_URL}`)
console.log('⏰ Schedules:')
console.log('   - Data Update: Every 30 minutes')
console.log('   - Bulletin Send: Every hour')
console.log('   - Health Check: Every 5 minutes\n')

// Update market data every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] 📊 Updating market data...`)

  try {
    const response = await fetch(`${API_URL}/api/cron/update-data`)
    const result = await response.json()

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] ✅ Market data updated:`, result)
    } else {
      console.error(`[${new Date().toISOString()}] ❌ Market data update failed:`, result)
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❌ Market data update error:`, error.message)
  }
})

// Send bulletins every hour
cron.schedule('0 * * * *', async () => {
  const currentHour = new Date().getHours()
  console.log(`[${new Date().toISOString()}] 📧 Sending bulletins for hour ${currentHour}...`)

  try {
    const response = await fetch(`${API_URL}/api/cron/send-bulletins?hour=${currentHour}`)
    const result = await response.json()

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] ✅ Bulletins sent:`, result)
    } else {
      console.error(`[${new Date().toISOString()}] ❌ Bulletin send failed:`, result)
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❌ Bulletin send error:`, error.message)
  }
})

// Health check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch(`${API_URL}`)
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] 💚 Health check: OK`)
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❤️ Health check: FAILED - ${error.message}`)
  }
})

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...')
  process.exit(0)
})
