import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateNewsEmailTemplate } from '@/lib/emailService'
import { getFinancialNews } from '@/lib/scrapers'
import { getCurrencyData, getGoldData, getStockData } from '@/lib/scrapers'
import { summarizeNews } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    // Security check - only allow from authorized sources
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const currentHour = new Date().getHours()

    // Get subscribers who should receive emails at this hour
    const subscribers = await prisma.subscriber.findMany({
      where: {
        isActive: true,
        notificationHour: currentHour
      }
    })

    console.log(`Found ${subscribers.length} subscribers for hour ${currentHour}`)

    let successCount = 0
    let errorCount = 0

    for (const subscriber of subscribers) {
      try {
        // Check if already sent today based on frequency
        if (subscriber.lastSentAt) {
          const hoursSinceLastSent = (Date.now() - subscriber.lastSentAt.getTime()) / (1000 * 60 * 60)

          let minHours = 24 // daily
          if (subscriber.notificationFrequency === 'twice') minHours = 12
          if (subscriber.notificationFrequency === 'three_times') minHours = 8

          if (hoursSinceLastSent < minHours) {
            console.log(`Skipping ${subscriber.email} - sent ${hoursSinceLastSent}h ago`)
            continue
          }
        }

        const categories = subscriber.categories.split(',')
        const summaries = []

        // Fetch news and data for each category
        for (const category of categories) {
          const newsItems = await getFinancialNews(category as any)

          if (newsItems.length > 0) {
            const summary = await summarizeNews(newsItems, category)

            // Fetch market data
            let marketData = null
            if (category === 'doviz') {
              const currencies = await getCurrencyData()
              marketData = { currencies }
            } else if (category === 'altin') {
              const gold = await getGoldData()
              marketData = { gold }
            } else if (category === 'borsa') {
              const stocks = await getStockData()
              marketData = { stocks }
            }

            summaries.push({
              category,
              summary,
              marketData
            })
          }
        }

        if (summaries.length === 0) {
          console.log(`No news for ${subscriber.email}`)
          continue
        }

        // Generate and send email
        const emailHtml = generateNewsEmailTemplate(summaries, subscriber.email)

        const success = await sendEmail({
          to: subscriber.email,
          subject: `FinAlert - ${new Date().toLocaleDateString('tr-TR')} Günlük Finans Özeti`,
          html: emailHtml
        })

        if (success) {
          // Update last sent time
          await prisma.subscriber.update({
            where: { id: subscriber.id },
            data: { lastSentAt: new Date() }
          })
          successCount++
          console.log(`Sent email to ${subscriber.email}`)
        } else {
          errorCount++
          console.error(`Failed to send email to ${subscriber.email}`)
        }

        // Rate limiting - wait between sends
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: subscribers.length
    })

  } catch (error: any) {
    console.error('Send emails error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET(req: NextRequest) {
  try {
    const subscriberCount = await prisma.subscriber.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      status: 'healthy',
      activeSubscribers: subscriberCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
