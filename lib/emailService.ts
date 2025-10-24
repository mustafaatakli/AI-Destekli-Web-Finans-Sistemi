import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'FinAlert <noreply@finalert.com>',
      to,
      subject,
      html,
    })
    console.log(`✓ Email sent to: ${to} (Message ID: ${info.messageId})`)
    return true
  } catch (error: any) {
    console.error(`✗ Email send error to ${to}:`, error.message || error)
    // Rethrow error so caller can handle it
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Simple wrapper for sending email with individual parameters
 */
export async function sendEmailSimple(to: string, subject: string, html: string): Promise<boolean> {
  try {
    return await sendEmail({ to, subject, html })
  } catch (error) {
    // Return false instead of throwing, for backward compatibility
    return false
  }
}

export function generateNewsEmailTemplate(
  summaries: Array<{ category: string; summary: string; marketData?: any }>,
  subscriberEmail: string
): string {
  const categoryNames: Record<string, string> = {
    doviz: 'Döviz',
    altin: 'Altın',
    borsa: 'Borsa'
  }

  const categoryEmojis: Record<string, string> = {
    doviz: '💵',
    altin: '🏆',
    borsa: '📈'
  }

  const sections = summaries
    .map(({ category, summary, marketData }) => {
      let marketDataHtml = ''

      if (marketData) {
        if (category === 'doviz' && marketData.currencies) {
          marketDataHtml = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #495057;">Anlık Döviz Kurları</h4>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(marketData.currencies as Record<string, any>)
                  .filter(([key]) => !key.startsWith('_'))
                  .map(([currency, data]: [string, any]) => `
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600;">${currency}</td>
                      <td style="padding: 8px 0;">Alış: ${data.alis?.toFixed(2)} TL</td>
                      <td style="padding: 8px 0;">Satış: ${data.satis?.toFixed(2)} TL</td>
                    </tr>
                  `).join('')}
              </table>
            </div>
          `
        } else if (category === 'altin' && marketData.gold) {
          marketDataHtml = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #495057;">Anlık Altın Fiyatları</h4>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(marketData.gold as Record<string, any>)
                  .filter(([key]) => !key.startsWith('_'))
                  .map(([type, data]: [string, any]) => `
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; text-transform: capitalize;">${type}</td>
                      <td style="padding: 8px 0;">Alış: ${data.alis !== null && data.alis !== undefined ? data.alis.toFixed(2) + ' TL' : '-'}</td>
                      <td style="padding: 8px 0;">Satış: ${data.satis !== null && data.satis !== undefined ? data.satis.toFixed(2) + ' TL' : '-'}</td>
                    </tr>
                  `).join('')}
              </table>
            </div>
          `
        } else if (category === 'borsa' && marketData.stocks) {
          marketDataHtml = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #495057;">Borsa Verileri</h4>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.entries(marketData.stocks as Record<string, any>)
                  .filter(([key]) => !key.startsWith('_')) // _kaynak gibi metadata alanlarını filtrele
                  .slice(0, 10) // Sadece ilk 10 hisse
                  .map(([symbol, data]: [string, any]) => `
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600;">${symbol}</td>
                      <td style="padding: 8px 0;">Fiyat: ${data.fiyat?.toFixed(2)} TL</td>
                      <td style="padding: 8px 0; color: ${(data.degisim || 0) >= 0 ? '#28a745' : '#dc3545'};">
                        ${(data.degisim || 0) >= 0 ? '▲' : '▼'} %${Math.abs(data.degisim || 0).toFixed(2)}
                      </td>
                    </tr>
                  `).join('')}
              </table>
            </div>
          `
        }
      }

      return `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 15px;">
            ${categoryEmojis[category]} ${categoryNames[category]} Haberleri
          </h2>
          <div style="color: #34495e; line-height: 1.6;">
            ${summary}
          </div>
          ${marketDataHtml}
        </div>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FinAlert - Günlük Finans Özeti</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    FinAlert
                  </h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Günlük Finans Haberleri Özeti
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #7f8c8d; margin: 0 0 20px 0; font-size: 14px;">
                    Merhaba,
                  </p>
                  <p style="color: #7f8c8d; margin: 0 0 30px 0; font-size: 14px;">
                    Bugünün finans haberlerinin yapay zeka destekli özeti aşağıda yer alıyor:
                  </p>

                  ${sections}

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                    <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                      Bu e-posta size <strong>${subscriberEmail}</strong> adresine gönderilmiştir.
                    </p>
                    <p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">
                      Bildirim tercihlerinizi değiştirmek için web sitemizi ziyaret edin.
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
}
