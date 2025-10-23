import { NextRequest, NextResponse } from 'next/server'
import { getCurrencyData, getGoldData, getStockData, getFinancialNews } from '@/lib/scrapers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'

  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      type: type,
    }

    if (type === 'currency' || type === 'all') {
      console.log('Fetching currency data...')
      const currencyData = await getCurrencyData()
      results.currency = currencyData || { error: 'Failed to fetch currency data' }
    }

    if (type === 'gold' || type === 'all') {
      console.log('Fetching gold data...')
      const goldData = await getGoldData()
      results.gold = goldData || { error: 'Failed to fetch gold data' }
    }

    if (type === 'stock' || type === 'all') {
      console.log('Fetching stock data...')
      const stockData = await getStockData()
      results.stock = stockData || { error: 'Failed to fetch stock data' }
    }

    if (type === 'news' || type === 'all') {
      console.log('Fetching news...')
      const category = searchParams.get('category') as 'doviz' | 'altin' | 'borsa' || 'doviz'
      const news = await getFinancialNews(category)
      results.news = {
        category,
        count: news.length,
        items: news
      }
    }

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error: any) {
    console.error('Scraping test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
