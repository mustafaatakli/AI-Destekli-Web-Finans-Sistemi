import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeNews(newsItems: Array<{ title: string; url: string; content?: string }>, category: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const categoryNames: Record<string, string> = {
      doviz: 'Döviz',
      altin: 'Altın',
      borsa: 'Borsa'
    }

    const newsText = newsItems
      .map((item, index) => `${index + 1}. ${item.title}`)
      .join('\n')

    const categoryContext: Record<string, string> = {
      doviz: 'döviz kurları, para birimleri, TCMB, faiz oranları ve enflasyon',
      altin: 'altın fiyatları, gram altın, çeyrek altın ve değerli metaller',
      borsa: 'Borsa İstanbul (BIST), hisse senetleri, endeksler ve şirket haberleri'
    }

    const prompt = `Sen bir finans editörüsün. Aşağıdaki ${categoryNames[category] || category} haberlerini Türkçe olarak kısa ve öz bir şekilde özetle.

KURALLAR:
- Maksimum 3-4 KISA cümle yaz
- Sadece ${categoryContext[category] || category} ile DOĞRUDAN ilgili haberleri özetle
- Jaguar, otomobil, zeytinyağı, gıda gibi ALAKASIZ haberleri ATLA
- Sayıları ve yüzdeleri kullan (örn: "yüzde 0.3 arttı")
- Profesyonel ve anlaşılır dil kullan
- Eğer HİÇBİR haber ${categoryNames[category]} ile alakalı değilse: "Bu kategoride güncel haber bulunmamaktadır." yaz

Haberler:
${newsText}

Kısa Özet:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text().trim()
    
    // Eğer çok uzunsa (1000 karakterden fazla), kısalt
    if (summary.length > 1000) {
      const shortenPrompt = `Şu özeti daha da kısalt, maksimum 3-4 cümle olsun:\n\n${summary}`
      const shortenResult = await model.generateContent(shortenPrompt)
      const shortenResponse = await shortenResult.response
      return shortenResponse.text().trim()
    }
    
    return summary
  } catch (error) {
    console.error('Gemini API error:', error)
    return 'Haber özeti şu an oluşturulamadı.'
  }
}
