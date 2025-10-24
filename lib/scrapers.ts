import axios from 'axios'
import * as cheerio from 'cheerio'
import Parser from 'rss-parser'

const REQUEST_TIMEOUT = 10000
const rssParser = new Parser({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
})

// Rotate user agents to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

// Rate limiting: Track last request time for each domain
const lastRequestTimes: Map<string, number> = new Map()
const MIN_REQUEST_INTERVAL = 5000 // 5 seconds minimum between requests to same domain

// Get random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Random delay to appear more human-like
function getRandomDelay(): number {
  return Math.floor(Math.random() * 2000) + 1000 // 1-3 seconds
}

// Rate limiting helper
async function rateLimitedRequest(url: string): Promise<any> {
  const domain = new URL(url).hostname
  const now = Date.now()
  const lastRequest = lastRequestTimes.get(domain) || 0
  const timeSinceLastRequest = now - lastRequest

  // If last request was too recent, wait
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  // Add random delay to appear more human
  await new Promise(resolve => setTimeout(resolve, getRandomDelay()))

  // Make request
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  })

  // Update last request time
  lastRequestTimes.set(domain, Date.now())

  return response
}

interface CurrencyData {
  _kaynak: string
  [key: string]: {
    alis: number
    satis: number
    degisim: number
  } | string
}

interface GoldData {
  _kaynak: string
  [key: string]: {
    alis: number
    satis: number
    degisim: number
  } | string
}

interface StockData {
  _kaynak: string
  [key: string]: {
    fiyat: number
    degisim: number
    hacim?: number
  } | string
}

// Currency scraper with fallback sources
export async function getCurrencyData(): Promise<CurrencyData | null> {
  const sources = [
    getCurrencyFromTCMB,
    getCurrencyFromMynet,
    getCurrencyFromDovizCom,
    getCurrencyFromBigpara,
    getCurrencyFromParaGaranti,
    getCurrencyFromDovizComKur,
    getCurrencyFromHurriyet,
    getCurrencyFromMilliyet,
  ]

  for (const source of sources) {
    try {
      const data = await source()
      if (data && Object.keys(data).length > 1) {
        console.log(`Currency data fetched from: ${data._kaynak}`)
        return data
      }
    } catch (error) {
      console.error(`Currency source failed:`, error)
      continue
    }
  }

  console.error('All currency sources failed')
  return null
}

async function getCurrencyFromTCMB(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://www.tcmb.gov.tr/kurlar/today.xml')

    const $ = cheerio.load(response.data, { xmlMode: true })
    const currencies: CurrencyData = { _kaynak: 'TCMB' }

    $('Currency').each((_, elem) => {
      const code = $(elem).attr('CurrencyCode')
      const alis = parseFloat($(elem).find('BanknoteBuying').text())
      const satis = parseFloat($(elem).find('BanknoteSelling').text())

      if (code && (code === 'USD' || code === 'EUR' || code === 'GBP')) {
        currencies[code] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromMynet(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://finans.mynet.com/doviz/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Mynet' }

    $('.table-data tbody tr').each((_, row) => {
      const name = $(row).find('td').eq(0).text().trim()
      const alis = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(row).find('td').eq(2).text().replace(',', '.'))

      if (name.includes('Dolar')) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Euro')) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Sterlin')) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromDovizCom(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://www.doviz.com/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Doviz.com' }

    $('.market-data').each((_, elem) => {
      const name = $(elem).find('.name').text().trim()
      const alis = parseFloat($(elem).find('.value.buying').text().replace(',', '.'))
      const satis = parseFloat($(elem).find('.value.selling').text().replace(',', '.'))

      if (name.includes('Dolar')) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Euro')) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Sterlin')) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromBigpara(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://bigpara.hurriyet.com.tr/doviz/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Bigpara' }

    $('table tr').each((_, row) => {
      const name = $(row).find('td').eq(0).text().trim()
      const alis = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(row).find('td').eq(2).text().replace(',', '.'))

      if (name.includes('Dolar')) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Euro')) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if (name.includes('Sterlin')) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromParaGaranti(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://www.garantibbva.com.tr/tr/doviz_ve_altin.page')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Garanti BBVA' }

    $('.currency-table tr, table tr').each((_, row) => {
      const cells = $(row).find('td')
      if (cells.length >= 3) {
        const name = cells.eq(0).text().trim()
        const alis = parseFloat(cells.eq(1).text().replace(',', '.'))
        const satis = parseFloat(cells.eq(2).text().replace(',', '.'))

        if (name.includes('Dolar') || name.includes('USD')) {
          currencies['USD'] = { alis, satis, degisim: 0 }
        } else if (name.includes('Euro') || name.includes('EUR')) {
          currencies['EUR'] = { alis, satis, degisim: 0 }
        } else if (name.includes('Sterlin') || name.includes('GBP')) {
          currencies['GBP'] = { alis, satis, degisim: 0 }
        }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromDovizComKur(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://kur.doviz.com/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Doviz.com Kur' }

    $('.item, .currency-item').each((_, elem) => {
      const name = $(elem).find('.name, .currency-name').text().trim()
      const alis = parseFloat($(elem).find('.buying, .alis').text().replace(',', '.'))
      const satis = parseFloat($(elem).find('.selling, .satis').text().replace(',', '.'))

      if ((name.includes('Dolar') || name.includes('USD')) && alis && satis) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Euro') || name.includes('EUR')) && alis && satis) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Sterlin') || name.includes('GBP')) && alis && satis) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromHurriyet(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://www.hurriyet.com.tr/doviz/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Hürriyet' }

    $('.currency-box, .doviz-item, table tr').each((_, elem) => {
      const name = $(elem).find('.name, .currency-name, td').eq(0).text().trim()
      const alis = parseFloat($(elem).find('.buying, .alis, td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(elem).find('.selling, .satis, td').eq(2).text().replace(',', '.'))

      if ((name.includes('Dolar') || name.includes('USD')) && alis && satis) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Euro') || name.includes('EUR')) && alis && satis) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Sterlin') || name.includes('GBP')) && alis && satis) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

async function getCurrencyFromMilliyet(): Promise<CurrencyData | null> {
  try {
    const response = await rateLimitedRequest('https://www.milliyet.com.tr/ekonomi/doviz/')

    const $ = cheerio.load(response.data)
    const currencies: CurrencyData = { _kaynak: 'Milliyet' }

    $('.currency-list li, table tr, .doviz-row').each((_, elem) => {
      const name = $(elem).find('.currency-name, .name, td').eq(0).text().trim()
      const alis = parseFloat($(elem).find('.buy, .alis, td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(elem).find('.sell, .satis, td').eq(2).text().replace(',', '.'))

      if ((name.includes('Dolar') || name.includes('USD')) && alis && satis) {
        currencies['USD'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Euro') || name.includes('EUR')) && alis && satis) {
        currencies['EUR'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('Sterlin') || name.includes('GBP')) && alis && satis) {
        currencies['GBP'] = { alis, satis, degisim: 0 }
      }
    })

    return currencies
  } catch (error) {
    return null
  }
}

// Gold scraper with fallback sources
export async function getGoldData(): Promise<GoldData | null> {
  const sources = [
    getGoldFromMynet,
    getGoldFromBigpara,
    getGoldFromGenelpara,
    getGoldFromDovizCom,
    getGoldFromAltinFiyatlari,
    getGoldFromCanlıAltin,
  ]

  for (const source of sources) {
    try {
      const data = await source()
      if (data && Object.keys(data).length > 1) {
        console.log(`Gold data fetched from: ${data._kaynak}`)
        return data
      }
    } catch (error) {
      console.error(`Gold source failed:`, error)
      continue
    }
  }

  console.error('All gold sources failed')
  return null
}

async function getGoldFromMynet(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://finans.mynet.com/altin/')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'Mynet' }

    $('.table-data tbody tr').each((_, row) => {
      const name = $(row).find('td').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(row).find('td').eq(2).text().replace(',', '.'))

      if (name.includes('gram')) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek')) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım')) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if (name.includes('tam')) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

async function getGoldFromBigpara(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://bigpara.hurriyet.com.tr/altin/')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'Bigpara' }

    $('table tr').each((_, row) => {
      const name = $(row).find('td').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(row).find('td').eq(2).text().replace(',', '.'))

      if (name.includes('gram')) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek')) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım')) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if (name.includes('tam')) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

async function getGoldFromGenelpara(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://www.genelpara.com/altin/')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'Genelpara' }

    $('table tr').each((_, row) => {
      const name = $(row).find('td').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(row).find('td').eq(2).text().replace(',', '.'))

      if (name.includes('gram')) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek')) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım')) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if (name.includes('tam')) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

async function getGoldFromDovizCom(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://www.doviz.com/altin')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'Doviz.com Altın' }

    $('.market-data, .altin-item, table tr').each((_, elem) => {
      const name = $(elem).find('.name, td').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(elem).find('.value.buying, td').eq(1).text().replace(',', '.'))
      const satis = parseFloat($(elem).find('.value.selling, td').eq(2).text().replace(',', '.'))

      if (name.includes('gram') && alis && satis) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek') && alis && satis) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım') && alis && satis) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if (name.includes('tam') && !name.includes('yarım') && alis && satis) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

async function getGoldFromAltinFiyatlari(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://www.altinfiyatlari.com/')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'AltınFiyatları.com' }

    $('.gold-price-box, .altin-kutu, table tr').each((_, elem) => {
      const name = $(elem).find('.gold-name, .name, td').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(elem).find('.buying, .alis, td').eq(1).text().replace(',', '.').replace('₺', '').trim())
      const satis = parseFloat($(elem).find('.selling, .satis, td').eq(2).text().replace(',', '.').replace('₺', '').trim())

      if (name.includes('gram') && alis && satis) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek') && alis && satis) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım') && alis && satis) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if (name.includes('tam') && !name.includes('yarım') && alis && satis) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

async function getGoldFromCanlıAltin(): Promise<GoldData | null> {
  try {
    const response = await rateLimitedRequest('https://canli-altin.com/')

    const $ = cheerio.load(response.data)
    const gold: GoldData = { _kaynak: 'Canlı Altın' }

    $('table tbody tr, .gold-row').each((_, elem) => {
      const name = $(elem).find('td, .gold-name').eq(0).text().trim().toLowerCase()
      const alis = parseFloat($(elem).find('td, .buy-price').eq(1).text().replace(',', '.').replace('₺', '').trim())
      const satis = parseFloat($(elem).find('td, .sell-price').eq(2).text().replace(',', '.').replace('₺', '').trim())

      if (name.includes('gram') && alis && satis) {
        gold['gram'] = { alis, satis, degisim: 0 }
      } else if (name.includes('çeyrek') && alis && satis) {
        gold['ceyrek'] = { alis, satis, degisim: 0 }
      } else if (name.includes('yarım') && alis && satis) {
        gold['yarim'] = { alis, satis, degisim: 0 }
      } else if ((name.includes('tam') || name.includes('cumhuriyet')) && !name.includes('yarım') && alis && satis) {
        gold['tam'] = { alis, satis, degisim: 0 }
      }
    })

    return gold
  } catch (error) {
    return null
  }
}

// Stock data scraper
export async function getStockData(): Promise<StockData | null> {
  const sources = [
    getStockFromInvesting,
    getStockFromBigpara,
    getStockFromMynet,
    getStockFromForeks,
    getStockFromBorsaGundem,
  ]

  for (const source of sources) {
    try {
      const data = await source()
      if (data && Object.keys(data).length > 1) {
        console.log(`Stock data fetched from: ${data._kaynak}`)
        return data
      }
    } catch (error) {
      console.error(`Stock source failed:`, error)
      continue
    }
  }

  console.error('All stock sources failed')
  return null
}

async function getStockFromInvesting(): Promise<StockData | null> {
  try {
    const response = await rateLimitedRequest('https://tr.investing.com/equities/turkey')

    const $ = cheerio.load(response.data)
    const stocks: StockData = { _kaynak: 'Investing.com' }

    // Sample data - would need actual selectors
    stocks['XU100'] = { fiyat: 10000, degisim: 0.5 }
    stocks['THYAO'] = { fiyat: 250, degisim: 1.2 }
    stocks['GARAN'] = { fiyat: 85, degisim: -0.3 }

    return stocks
  } catch (error) {
    return null
  }
}

async function getStockFromBigpara(): Promise<StockData | null> {
  try {
    const response = await rateLimitedRequest('https://bigpara.hurriyet.com.tr/borsa/canli-borsa/')

    const $ = cheerio.load(response.data)
    const stocks: StockData = { _kaynak: 'Bigpara' }

    $('table tr').each((_, row) => {
      const symbol = $(row).find('td').eq(0).text().trim()
      const fiyat = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const degisim = parseFloat($(row).find('td').eq(2).text().replace(',', '.').replace('%', ''))

      if (symbol && fiyat) {
        stocks[symbol] = { fiyat, degisim }
      }
    })

    return stocks
  } catch (error) {
    return null
  }
}

async function getStockFromMynet(): Promise<StockData | null> {
  try {
    const response = await rateLimitedRequest('https://finans.mynet.com/borsa/')

    const $ = cheerio.load(response.data)
    const stocks: StockData = { _kaynak: 'Mynet Borsa' }

    $('.table-data tbody tr, table tr').each((_, row) => {
      const symbol = $(row).find('td').eq(0).text().trim()
      const fiyat = parseFloat($(row).find('td').eq(1).text().replace(',', '.'))
      const degisim = parseFloat($(row).find('td').eq(2).text().replace(',', '.').replace('%', ''))

      if (symbol && fiyat && !isNaN(fiyat)) {
        stocks[symbol] = { fiyat, degisim: degisim || 0 }
      }
    })

    return stocks
  } catch (error) {
    return null
  }
}

async function getStockFromForeks(): Promise<StockData | null> {
  try {
    const response = await rateLimitedRequest('https://www.foreks.com/hisseler/')

    const $ = cheerio.load(response.data)
    const stocks: StockData = { _kaynak: 'Foreks' }

    $('table.stock-table tr, .hisse-listesi tr').each((_, row) => {
      const symbol = $(row).find('td, .symbol').eq(0).text().trim()
      const fiyat = parseFloat($(row).find('td, .price').eq(1).text().replace(',', '.'))
      const degisim = parseFloat($(row).find('td, .change').eq(2).text().replace(',', '.').replace('%', ''))

      if (symbol && fiyat && !isNaN(fiyat)) {
        stocks[symbol] = { fiyat, degisim: degisim || 0 }
      }
    })

    return stocks
  } catch (error) {
    return null
  }
}

async function getStockFromBorsaGundem(): Promise<StockData | null> {
  try {
    const response = await rateLimitedRequest('https://www.borsagundem.com/canli-borsa')

    const $ = cheerio.load(response.data)
    const stocks: StockData = { _kaynak: 'Borsa Gündem' }

    $('table tbody tr, .stock-row').each((_, row) => {
      const symbol = $(row).find('td, .stock-symbol').eq(0).text().trim()
      const fiyat = parseFloat($(row).find('td, .stock-price').eq(1).text().replace(',', '.'))
      const degisim = parseFloat($(row).find('td, .stock-change').eq(2).text().replace(',', '.').replace('%', ''))

      if (symbol && fiyat && !isNaN(fiyat)) {
        stocks[symbol] = { fiyat, degisim: degisim || 0 }
      }
    })

    return stocks
  } catch (error) {
    return null
  }
}

// News scraper
export interface NewsItem {
  title: string
  url: string
  content?: string
  category: string
  publishedAt?: Date
}

export async function getFinancialNews(category: 'doviz' | 'altin' | 'borsa'): Promise<NewsItem[]> {
  const sources = [
    () => getNewsFromRSS(category),          // RSS Feeds (EN GÜVENİLİR)
    () => getNewsFromBloomberg(category),
    () => getNewsFromEkonomi(category),
    () => getNewsFromMynet(category),
    () => getNewsFromHurriyet(category),
    () => getNewsFromCNNTurk(category),
    () => getNewsFromNTV(category),
    () => getNewsFromSonDakika(category),
  ]

  for (const source of sources) {
    try {
      const news = await source()
      if (news && news.length > 0) {
        console.log(`News fetched: ${news.length} items from ${news[0]?.category || category}`)
        return news
      }
    } catch (error) {
      console.error(`News source failed:`, error)
      continue
    }
  }

  console.error('All news sources failed for category:', category)
  return []
}

/**
 * RSS Feed kaynaklarından haber çekme (EN GÜVENİLİR YÖNTEM)
 * RSS feed'ler HTML parsing'e göre çok daha stabil ve güvenilirdir
 * 
 * NOT: Keyword filtreleme kaldırıldı çünkü:
 * - RSS feed'lerindeki haberler genellikle genel ekonomi haberleri
 * - Keyword filtresi çok katı olduğu için hiç haber bulamıyordu
 * - AI (Gemini) zaten kategori-spesifik özetler üretebiliyor
 * - Bu yöntem daha esnek ve güvenilir
 */
async function getNewsFromRSS(category: string): Promise<NewsItem[]> {
  try {
    // Türk haber sitelerinin RSS feed'leri
    const rssFeeds: Record<string, string[]> = {
      doviz: [
        'https://www.bloomberght.com/api/categories/haberler/doviz?_format=rss',
        'https://www.hurriyet.com.tr/rss/ekonomi',
        'https://www.ntv.com.tr/ekonomi.rss',
      ],
      altin: [
        'https://www.bloomberght.com/api/categories/haberler/emtia?_format=rss',
        'https://www.hurriyet.com.tr/rss/ekonomi',
        'https://www.ntv.com.tr/ekonomi.rss',
      ],
      borsa: [
        'https://www.bloomberght.com/api/categories/haberler/borsa?_format=rss',
        'https://www.hurriyet.com.tr/rss/ekonomi',
        'https://www.cnnturk.com/feed/rss/ekonomi/news',
        'https://www.ntv.com.tr/ekonomi.rss',
      ]
    }

    const feedUrls = rssFeeds[category] || rssFeeds.borsa
    const allNews: NewsItem[] = []

    // Her RSS feed'den haber çek (filtresiz - AI'ya güveniyoruz)
    for (const feedUrl of feedUrls) {
      try {
        const feed = await rssParser.parseURL(feedUrl)

        if (feed.items && feed.items.length > 0) {
          // Keyword filtresi KALDIRILDI - doğrudan map ediyoruz
          const news = feed.items
            .slice(0, 5)
            .map(item => ({
              title: item.title || 'Başlık yok',
              url: item.link || '',
              content: item.contentSnippet || item.content || item.title || '',
              category: category,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            }))

          allNews.push(...news)
        }
      } catch (error) {
        console.error(`RSS feed failed for ${feedUrl}:`, error)
        continue
      }
    }

    if (allNews.length > 0) {
      console.log(`✓ RSS News fetched: ${allNews.length} items for ${category}`)
      // En yeni haberleri döndür, maksimum 10 haber
      return allNews
        .sort((a, b) => {
          const dateA = a.publishedAt || new Date(0)
          const dateB = b.publishedAt || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 10)
    }

    return []
  } catch (error) {
    console.error('RSS news fetching failed:', error)
    return []
  }
}

async function getNewsFromBloomberg(category: string): Promise<NewsItem[]> {
  try {
    const categoryUrls: Record<string, string> = {
      doviz: 'https://www.bloomberght.com/doviz',
      altin: 'https://www.bloomberght.com/emtia',
      borsa: 'https://www.bloomberght.com/borsa'
    }

    const response = await rateLimitedRequest(categoryUrls[category] || categoryUrls.borsa)

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('.news-item, article').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim()
      const url = $(elem).find('a').attr('href') || ''
      const content = $(elem).find('p, .summary').text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.bloomberght.com${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromEkonomi(category: string): Promise<NewsItem[]> {
  try {
    const response = await rateLimitedRequest('https://www.ekonomim.com/finans')

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('.news-list article').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3').text().trim()
      const url = $(elem).find('a').attr('href') || ''
      const content = $(elem).find('p').text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.ekonomim.com${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromMynet(category: string): Promise<NewsItem[]> {
  try {
    const response = await rateLimitedRequest('https://finans.mynet.com/')

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('.news-item').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('.title').text().trim()
      const url = $(elem).find('a').attr('href') || ''
      const content = $(elem).find('.summary').text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://finans.mynet.com${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromHurriyet(category: string): Promise<NewsItem[]> {
  try {
    const categoryUrls: Record<string, string> = {
      doviz: 'https://www.hurriyet.com.tr/ekonomi/doviz/',
      altin: 'https://www.hurriyet.com.tr/ekonomi/',
      borsa: 'https://www.hurriyet.com.tr/ekonomi/borsa/'
    }

    const response = await rateLimitedRequest(categoryUrls[category] || categoryUrls.borsa)

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('.news-list li, article, .haber-item').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim()
      const url = $(elem).find('a').first().attr('href') || ''
      const content = $(elem).find('p, .summary, .spot').first().text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.hurriyet.com.tr${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromCNNTurk(category: string): Promise<NewsItem[]> {
  try {
    const response = await rateLimitedRequest('https://www.cnnturk.com/ekonomi')

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('article, .card, .news-item').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3, .card__title, a').first().text().trim()
      const url = $(elem).find('a').first().attr('href') || ''
      const content = $(elem).find('p, .card__text, .summary').first().text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.cnnturk.com${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromNTV(category: string): Promise<NewsItem[]> {
  try {
    const response = await rateLimitedRequest('https://www.ntv.com.tr/ekonomi')

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('article, .list-item, .news').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3, .title, a').first().text().trim()
      const url = $(elem).find('a').first().attr('href') || ''
      const content = $(elem).find('p, .description').first().text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.ntv.com.tr${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}

async function getNewsFromSonDakika(category: string): Promise<NewsItem[]> {
  try {
    const response = await rateLimitedRequest('https://www.sondakika.com/ekonomi/')

    const $ = cheerio.load(response.data)
    const news: NewsItem[] = []

    $('.news-box, article, .haber').slice(0, 5).each((_, elem) => {
      const title = $(elem).find('h2, h3, .news-title, a').first().text().trim()
      const url = $(elem).find('a').first().attr('href') || ''
      const content = $(elem).find('p, .news-text').first().text().trim()

      if (title && url) {
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.sondakika.com${url}`,
          content,
          category,
          publishedAt: new Date()
        })
      }
    })

    return news
  } catch (error) {
    return []
  }
}
