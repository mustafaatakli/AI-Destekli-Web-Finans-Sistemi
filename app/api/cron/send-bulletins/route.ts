import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMarketData, getCachedNews } from '@/lib/dataCache'
import { summarizeNewsWithAI } from '@/lib/ai'
import { sendEmailSimple } from '@/lib/emailService'

/**
 * API endpoint to send scheduled bulletins to subscribers
 * Can be called by external cron services
 *
 * Usage: GET /api/cron/send-bulletins?hour=9
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

    const { searchParams } = new URL(request.url)
    const hourParam = searchParams.get('hour')
    const currentHour = hourParam ? parseInt(hourParam) : new Date().getHours()

    console.log(`Sending bulletins for hour: ${currentHour}`)

    // Get all active subscribers (not just for this hour)
    const now = new Date()
    const allSubscribers = await prisma.subscriber.findMany({
      where: {
        isActive: true
      }
    })

    if (allSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No active subscribers found`,
        sent: 0
      })
    }

    // Filter subscribers who should receive email at this hour
    const subscribers = allSubscribers.filter(subscriber => 
      shouldSendEmailAtHour(subscriber, currentHour, now)
    )

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No subscribers scheduled for hour ${currentHour}`,
        sent: 0
      })
    }

    console.log(`Found ${subscribers.length} subscribers to send at hour ${currentHour}`)

    // Get market data from cache
    const marketData = await getMarketData()

    // Process each subscriber
    let successCount = 0
    let failCount = 0

    for (const subscriber of subscribers) {
      try {
        // Parse categories
        const categories = subscriber.categories.split(',') as ('doviz' | 'altin' | 'borsa')[]

        // Collect news and summaries for all categories IN PARALLEL (3x faster!)
        const categorySummaries = await Promise.all(
          categories.map(async (category) => {
            const news = await getCachedNews(category)
            const limitedNews = news.slice(0, 5) // Get top 5 news for faster processing

            // Summarize all news for this category at once with AI
            let summary = ''
            try {
              if (limitedNews.length > 0) {
                const newsItems = limitedNews.map(item => ({
                  title: item.title,
                  url: item.url,
                  content: item.content || ''
                }))
                const { summarizeNews } = await import('@/lib/gemini')
                summary = await summarizeNews(newsItems, category)
              } else {
                summary = `${category} kategorisinde henüz haber bulunmamaktadır.`
              }
            } catch (error) {
              console.error(`AI summarization failed for ${category}:`, error)
              summary = 'Haber özeti şu an oluşturulamadı.'
            }

            // Get category-specific market data
            let categoryMarketData = undefined
            if (category === 'doviz' && marketData.currency?.USD) {
              categoryMarketData = { currencies: marketData.currency }
            } else if (category === 'altin' && marketData.gold?.gram) {
              categoryMarketData = { gold: marketData.gold }
            } else if (category === 'borsa' && marketData.stock) {
              categoryMarketData = { stocks: marketData.stock }
            }

            return {
              category,
              summary,
              marketData: categoryMarketData
            }
          })
        )

        // Send email
        const { generateNewsEmailTemplate } = await import('@/lib/emailService')
        await sendEmailSimple(
          subscriber.email,
          'FinAlert - Günlük Finans Özeti',
          generateNewsEmailTemplate(categorySummaries, subscriber.email)
        )

        // Update last sent time
        await prisma.subscriber.update({
          where: { id: subscriber.id },
          data: { lastSentAt: new Date() }
        })

        successCount++
        console.log(`✓ Bulletin sent to: ${subscriber.email}`)
      } catch (error) {
        failCount++
        console.error(`✗ Failed to send bulletin to ${subscriber.email}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulletins sent successfully`,
      sent: successCount,
      failed: failCount,
      total: subscribers.length
    })
  } catch (error) {
    console.error('Failed to send bulletins:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send bulletins',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Check if subscriber should receive email at this specific hour
 * based on their notification frequency and last sent time
 */
function shouldSendEmailAtHour(subscriber: any, currentHour: number, now: Date): boolean {
  const { notificationHour, notificationFrequency, lastSentAt } = subscriber

  // If never sent before, only send at their chosen hour
  if (!lastSentAt) {
    return currentHour === notificationHour
  }

  const lastSent = new Date(lastSentAt)
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)

  switch (notificationFrequency) {
    case 'daily':
      // Send once per day at their chosen hour
      return currentHour === notificationHour && hoursSinceLastSent >= 23

    case 'twice':
      // Send twice per day: at chosen hour and 12 hours later
      const isFirstSend = currentHour === notificationHour && hoursSinceLastSent >= 23
      const isSecondSend = currentHour === (notificationHour + 12) % 24 && hoursSinceLastSent >= 11
      return isFirstSend || isSecondSend

    case 'three_times':
      // Send three times per day: at chosen hour, +6h, and +12h
      const isFirst = currentHour === notificationHour && hoursSinceLastSent >= 23
      const isSecond = currentHour === (notificationHour + 6) % 24 && hoursSinceLastSent >= 5
      const isThird = currentHour === (notificationHour + 12) % 24 && hoursSinceLastSent >= 5
      return isFirst || isSecond || isThird

    default:
      return currentHour === notificationHour
  }
}

/**
 * Check if subscriber should receive email based on frequency
 */
function shouldSendEmail(subscriber: any, now: Date): boolean {
  // If never sent before, send now
  if (!subscriber.lastSentAt) {
    return true
  }

  const lastSent = new Date(subscriber.lastSentAt)
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)

  switch (subscriber.notificationFrequency) {
    case 'daily':
      // Send once per day (minimum 23 hours apart)
      return hoursSinceLastSent >= 23
    case 'twice':
      // Send twice per day (minimum 11 hours apart)
      return hoursSinceLastSent >= 11
    case 'three_times':
      // Send three times per day (minimum 7 hours apart)
      return hoursSinceLastSent >= 7
    default:
      return true
  }
}
