import { NextRequest, NextResponse } from 'next/server'
import { updateMarketDataCache } from '@/lib/dataCache'

/**
 * API endpoint to manually trigger market data update
 * Can be called by external cron services like cron-job.org
 *
 * Usage: GET /api/cron/update-data
 * Requires: Authorization: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Check CRON authentication
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Vercel Cron jobs send a special header
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')

    if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      console.error('❌ Unauthorized cron access attempt')
      return NextResponse.json(
        { error: 'Unauthorized - Valid CRON_SECRET required' },
        { status: 401 }
      )
    }

    console.log('Manual market data update triggered via API')

    const startTime = Date.now()
    const result = await updateMarketDataCache()
    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: 'Market data updated successfully',
      data: {
        currency: result.currency._kaynak,
        gold: result.gold._kaynak,
        stock: result.stock._kaynak,
        lastUpdated: result.lastUpdated,
        duration: `${duration}ms`
      }
    })
  } catch (error) {
    console.error('Failed to update market data:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update market data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
