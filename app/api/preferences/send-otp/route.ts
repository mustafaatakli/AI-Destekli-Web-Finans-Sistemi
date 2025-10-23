import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOTP } from '@/lib/otp'
import { sendEmail } from '@/lib/emailService'
import { sanitizeEmail, isValidEmail, checkRateLimit } from '@/lib/sanitize'

/**
 * Send OTP code to user's email for verification
 * POST /api/preferences/send-otp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { email } = body

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`otp:${clientIP}`, 3, 60000)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen 1 dakika sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    // Sanitize email
    email = sanitizeEmail(email)

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Check if user exists
    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Generate OTP (now async)
    const otpCode = await createOTP(email)

    // Send OTP email
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                      🔐 Doğrulama Kodu
                    </h1>
                    <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
                      FinAlert - Bildirim Tercihleri
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Merhaba,
                    </p>
                    <p style="color: #34495e; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                      Bildirim tercihlerinizi değiştirmek için aşağıdaki doğrulama kodunu kullanın:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                      <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9; font-weight: 600;">
                        DOĞRULAMA KODU
                      </p>
                      <p style="color: #ffffff; margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otpCode}
                      </p>
                    </div>

                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                      <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                        ⏰ <strong>Bu kod 10 dakika geçerlidir.</strong><br>
                        🔒 Bu kodu kimseyle paylaşmayın.<br>
                        ❌ Bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelin.
                      </p>
                    </div>

                    <p style="color: #7f8c8d; font-size: 13px; margin: 30px 0 0 0; line-height: 1.6;">
                      Kodunuzu girmek için: <a href="http://localhost:3005/preferences" style="color: #667eea; text-decoration: none;">Tercihlerim Sayfası</a>
                    </p>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                      <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                        Bu e-posta <strong>${email}</strong> adresine gönderilmiştir.
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
      subject: `🔐 FinAlert Doğrulama Kodu: ${otpCode}`,
      html
    })

    console.log(`✅ OTP email sent to ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Doğrulama kodu e-posta adresinize gönderildi',
      expiresIn: 600 // 10 minutes in seconds
    })

  } catch (error) {
    console.error('❌ OTP send error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
