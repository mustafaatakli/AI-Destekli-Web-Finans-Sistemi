import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/emailService'
import { 
  sanitizeEmail, 
  sanitizeCategories, 
  sanitizeHour, 
  sanitizeFrequency,
  isValidEmail,
  checkRateLimit,
  containsSQLInjection
} from '@/lib/sanitize'

// Helper function to send welcome email
async function sendWelcomeEmail(
  email: string, 
  preferences: { categories: string[], hour: number, frequency: string }
) {
  const categoryNames: Record<string, string> = {
    doviz: 'Döviz',
    altin: 'Altın',
    borsa: 'Borsa'
  }

  const frequencyNames: Record<string, string> = {
    daily: 'Günde 1 kez',
    twice: 'Günde 2 kez',
    three_times: 'Günde 3 kez'
  }

  const categoriesList = preferences.categories
    .map(cat => `• ${categoryNames[cat] || cat}`)
    .join('<br>')

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FinAlert'e Hoş Geldiniz</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                    🎉 Hoş Geldiniz!
                  </h1>
                  <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">
                    FinAlert ailesine katıldığınız için teşekkürler
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">
                    Merhaba! 👋
                  </h2>
                  <p style="color: #34495e; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                    FinAlert'e başarıyla kaydoldunuz. Artık size özel finans haberlerini düzenli olarak e-posta adresinize göndereceğiz.
                  </p>

                  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">
                      📋 Bildirim Tercihleriniz
                    </h3>
                    
                    <div style="margin-bottom: 15px;">
                      <p style="color: #7f8c8d; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                        Takip Edilen Kategoriler:
                      </p>
                      <div style="color: #2c3e50; font-size: 15px; line-height: 1.8;">
                        ${categoriesList}
                      </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                      <p style="color: #7f8c8d; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                        Bildirim Saati:
                      </p>
                      <div style="color: #2c3e50; font-size: 15px;">
                        🕐 ${preferences.hour.toString().padStart(2, '0')}:00
                      </div>
                    </div>

                    <div>
                      <p style="color: #7f8c8d; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                        Bildirim Sıklığı:
                      </p>
                      <div style="color: #2c3e50; font-size: 15px;">
                        📬 ${frequencyNames[preferences.frequency] || preferences.frequency}
                      </div>
                    </div>
                  </div>

                  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 25px 0;">
                    <p style="color: #1976d2; margin: 0; font-size: 14px; line-height: 1.6;">
                      <strong>💡 İpucu:</strong> İlk bülteniniz ${preferences.hour.toString().padStart(2, '0')}:00'da size ulaşacak. 
                      Tercihlerinizi dilediğiniz zaman web sitemizden değiştirebilirsiniz.
                    </p>
                  </div>

                  <h3 style="color: #2c3e50; margin: 30px 0 15px 0; font-size: 18px;">
                    ⚡ Neler Sunuyoruz?
                  </h3>
                  <ul style="color: #34495e; line-height: 1.8; padding-left: 20px; margin: 0;">
                    <li>Yapay zeka destekli haber özetleri</li>
                    <li>Anlık döviz ve altın kurları</li>
                    <li>Borsa verileri ve analizler</li>
                    <li>Size özel bildirim saatleri</li>
                    <li>Kategoriye özel içerikler</li>
                  </ul>

                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #7f8c8d; margin: 0 0 15px 0; font-size: 14px;">
                      Sorularınız için bizimle iletişime geçebilirsiniz
                    </p>
                    <a href="mailto:${process.env.SMTP_USER}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      İletişime Geç
                    </a>
                  </div>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                    <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                      Bu e-posta <strong>${email}</strong> adresine gönderilmiştir.
                    </p>
                    <p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">
                      Aboneliğinizi iptal etmek isterseniz web sitemizi ziyaret edin.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
                  <p style="color: #ecf0f1; margin: 0; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} FinAlert. Tüm hakları saklıdır.
                  </p>
                  <p style="color: #95a5a6; margin: 10px 0 0 0; font-size: 11px;">
                    Powered by Gemini AI
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: '🎉 FinAlert\'e Hoş Geldiniz!',
    html
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { email, categories, notificationHour, notificationFrequency } = body

    // 🔒 SECURITY: Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`subscribe:${clientIP}`, 5, 60000)) {
      console.log('❌ Rate limit exceeded:', clientIP)
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen 1 dakika sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    // 🔒 SECURITY: Sanitize inputs
    email = sanitizeEmail(email)
    
    // Check for SQL injection attempts
    if (containsSQLInjection(email)) {
      console.log('❌ SQL injection attempt detected:', email)
      return NextResponse.json(
        { error: 'Geçersiz girdi tespit edildi' },
        { status: 400 }
      )
    }

    console.log('📝 Subscribe request received:', {
      email,
      categories,
      notificationHour,
      notificationFrequency
    })

    // Validation
    if (!email || !isValidEmail(email)) {
      console.log('❌ Invalid email:', email)
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Sanitize categories
    // If categories is a comma-separated string, split it first
    let categoriesArray: string[]
    if (Array.isArray(categories)) {
      categoriesArray = categories
    } else if (typeof categories === 'string') {
      categoriesArray = categories.split(',').map(c => c.trim())
    } else {
      categoriesArray = []
    }
    const sanitizedCategories = sanitizeCategories(categoriesArray)
    
    if (sanitizedCategories.length === 0) {
      console.log('❌ No valid categories selected')
      return NextResponse.json(
        { error: 'En az bir kategori seçin' },
        { status: 400 }
      )
    }

    // Sanitize hour and frequency
    const sanitizedHour = sanitizeHour(notificationHour)
    const sanitizedFrequency = sanitizeFrequency(notificationFrequency)

    // Check if email already exists
    const existing = await prisma.subscriber.findUnique({
      where: { email }
    })

    // Convert categories array to comma-separated string
    const categoriesString = sanitizedCategories.join(',')

    if (existing) {
      // Update existing subscriber
      const updated = await prisma.subscriber.update({
        where: { email },
        data: {
          categories: categoriesString,
          notificationHour: sanitizedHour,
          notificationFrequency: sanitizedFrequency,
          isActive: true,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Tercihleriniz güncellendi',
        subscriber: updated
      })
    }

    // Create new subscriber
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        categories: categoriesString,
        notificationHour: sanitizedHour,
        notificationFrequency: sanitizedFrequency,
        isActive: true
      }
    })

    // Send welcome email
    try {
      console.log('📧 Sending welcome email to:', subscriber.email)
      await sendWelcomeEmail(subscriber.email, {
        categories: sanitizedCategories,
        hour: sanitizedHour,
        frequency: sanitizedFrequency
      })
      console.log('✅ Welcome email sent successfully')
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError)
      // Don't fail the subscription if email fails
    }

    console.log('✅ Subscription created successfully:', subscriber.email)
    return NextResponse.json({
      success: true,
      message: 'Kayıt başarılı',
      subscriber
    })
  } catch (error: any) {
    console.error('❌ Subscribe error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Abonelik iptal edildi'
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
