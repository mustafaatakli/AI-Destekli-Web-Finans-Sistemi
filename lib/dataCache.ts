import { PrismaClient } from '@prisma/client'
import { getCurrencyData, getGoldData, getStockData, getFinancialNews, type NewsItem } from './scrapers'

const prisma = new PrismaClient()

// Cache duration in milliseconds
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export interface CachedMarketData {
  currency: any
  gold: any
  stock: any
  lastUpdated: Date
}

/**
 * Get cached market data or fetch fresh if cache is expired
 */
export async function getMarketData(): Promise<CachedMarketData> {
  const now = new Date()
  const cacheExpiry = new Date(now.getTime() - CACHE_DURATION)

  // Try to get from cache
  const [cachedCurrency, cachedGold, cachedStock] = await Promise.all([
    prisma.marketData.findFirst({
      where: {
        dataType: 'currency',
        updatedAt: { gte: cacheExpiry }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.marketData.findFirst({
      where: {
        dataType: 'gold',
        updatedAt: { gte: cacheExpiry }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.marketData.findFirst({
      where: {
        dataType: 'stock',
        updatedAt: { gte: cacheExpiry }
      },
      orderBy: { updatedAt: 'desc' }
    })
  ])

  // If all data is cached and fresh, return it
  if (cachedCurrency && cachedGold && cachedStock) {
    console.log('Using cached market data')
    return {
      currency: JSON.parse(cachedCurrency.data),
      gold: JSON.parse(cachedGold.data),
      stock: JSON.parse(cachedStock.data),
      lastUpdated: cachedCurrency.updatedAt
    }
  }

  // Otherwise, fetch fresh data
  console.log('Fetching fresh market data')
  return await updateMarketDataCache()
}

/**
 * Force update market data cache
 */
export async function updateMarketDataCache(): Promise<CachedMarketData> {
  const [currencyData, goldData, stockData] = await Promise.all([
    getCurrencyData(),
    getGoldData(),
    getStockData()
  ])

  if (!currencyData || !goldData || !stockData) {
    throw new Error('Failed to fetch market data from all sources')
  }

  // Save to database
  await Promise.all([
    prisma.marketData.create({
      data: {
        dataType: 'currency',
        data: JSON.stringify(currencyData),
        source: currencyData._kaynak || 'unknown'
      }
    }),
    prisma.marketData.create({
      data: {
        dataType: 'gold',
        data: JSON.stringify(goldData),
        source: goldData._kaynak || 'unknown'
      }
    }),
    prisma.marketData.create({
      data: {
        dataType: 'stock',
        data: JSON.stringify(stockData),
        source: stockData._kaynak || 'unknown'
      }
    })
  ])

  console.log('Market data cache updated successfully')
  console.log(`Sources - Currency: ${currencyData._kaynak}, Gold: ${goldData._kaynak}, Stock: ${stockData._kaynak}`)

  return {
    currency: currencyData,
    gold: goldData,
    stock: stockData,
    lastUpdated: new Date()
  }
}

/**
 * Clean up old cached data (keep only last 100 entries per type)
 */
export async function cleanupOldCache(): Promise<void> {
  const types = ['currency', 'gold', 'stock']

  for (const type of types) {
    // Get all entries for this type
    const entries = await prisma.marketData.findMany({
      where: { dataType: type },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    })

    // If more than 100 entries, delete the oldest ones
    if (entries.length > 100) {
      const idsToKeep = entries.slice(0, 100).map(e => e.id)
      await prisma.marketData.deleteMany({
        where: {
          dataType: type,
          id: { notIn: idsToKeep }
        }
      })
      console.log(`Cleaned up ${entries.length - 100} old ${type} cache entries`)
    }
  }
}

/**
 * Get cached news or fetch fresh if not available
 */
export async function getCachedNews(category: 'doviz' | 'altin' | 'borsa'): Promise<NewsItem[]> {
  const cacheExpiry = new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours

  // Try to get from cache
  const cachedNews = await prisma.newsCache.findMany({
    where: {
      category,
      createdAt: { gte: cacheExpiry }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  if (cachedNews.length > 0) {
    console.log(`Using ${cachedNews.length} cached news items for category: ${category}`)
    return cachedNews.map(item => ({
      title: item.newsTitle,
      url: item.newsUrl,
      content: item.summary,
      category: item.category,
      publishedAt: item.createdAt
    }))
  }

  // Otherwise, fetch fresh news
  console.log(`Fetching fresh news for category: ${category}`)
  const freshNews = await getFinancialNews(category)

  // Cache the news (but don't save summaries yet - that's done by AI service)
  if (freshNews.length > 0) {
    await Promise.all(
      freshNews.map(item =>
        prisma.newsCache.create({
          data: {
            category,
            newsTitle: item.title,
            newsUrl: item.url,
            summary: item.content || ''
          }
        })
      )
    )
  }

  return freshNews
}

/**
 * Update news summary (called after AI summarization)
 */
export async function updateNewsSummary(newsUrl: string, summary: string): Promise<void> {
  await prisma.newsCache.updateMany({
    where: { newsUrl },
    data: { summary }
  })
  console.log(`Updated summary for news: ${newsUrl}`)
}

/**
 * Clean up old news cache (keep only last 7 days)
 */
export async function cleanupOldNews(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const result = await prisma.newsCache.deleteMany({
    where: {
      createdAt: { lt: sevenDaysAgo }
    }
  })

  console.log(`Cleaned up ${result.count} old news items`)
}
