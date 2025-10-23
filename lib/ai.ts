import { summarizeNews } from './gemini'

/**
 * Summarize a single news item with AI
 */
export async function summarizeNewsWithAI(title: string, url: string, category: string): Promise<string> {
  try {
    const newsItems = [{ title, url, content: '' }]
    const summary = await summarizeNews(newsItems, category)
    return summary
  } catch (error) {
    console.error('AI summarization error:', error)
    return title // Fallback to just the title
  }
}

/**
 * Summarize multiple news items with AI
 */
export async function summarizeMultipleNews(
  newsItems: Array<{ title: string; url: string; content?: string }>,
  category: string
): Promise<string> {
  try {
    return await summarizeNews(newsItems, category)
  } catch (error) {
    console.error('AI summarization error:', error)
    return 'Haber özetleri şu an oluşturulamadı.'
  }
}
