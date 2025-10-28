# 📈 FinAlert - Yapay Zeka Destekli Finans Takip Sistemi

**[🇹🇷 Türkçe](#-finalert---yapay-zeka-destekli-finans-takip-sistemi)** | **[ENG English](#-finalert---ai-powered-finance-tracking-system)**

---

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://www.prisma.io/)

> Günlük finans piyasalarını takip etmek artık çok kolay! Döviz, altın ve borsa verilerini AI destekli özetlerle e-postanızda alın.
> Geliştirilmiş tip güvenliği, ölçeklenebilirlik ve sürdürülebilirlik için TypeScript ve React kullanılarak geliştirilmiştir.
---

## 🌟 Özellikler

### 💰 **Çoklu Piyasa Desteği**
- **Döviz:** USD, EUR, GBP kurları ve analizleri
- **Altın:** Gram, çeyrek, yarım ve tam altın fiyatları
- **Borsa:** BIST 100 endeksi ve popüler hisse senetleri

### 🤖 **Yapay Zeka Entegrasyonu**
- Google Gemini AI ile akıllı haber özetleme
- Karmaşık finans haberlerini anlaşılır dille sunma
- Günlük piyasa analizleri ve trend tespiti

### 📧 **Kişiselleştirilmiş Bildirimler**
- İstediğiniz kategorileri seçin (döviz, altın, borsa)
- Bildirim saatini belirleyin (08:00, 14:00, 20:00)
- Günlük, iki kez veya üç kez bildirim seçenekleri
- OTP ile güvenli tercih yönetimi

### 📱 **Telegram Bot Desteği**
- [@MyFinAlertBot](https://t.me/MyFinAlertBot) ile anlık sorgulama
- Komut tabanlı hızlı veri erişimi
- Bildirim tercihlerini Telegram'dan yönetme

### 🔒 **Güvenlik**
- Email-based OTP (One-Time Password) doğrulama
- Input sanitization (XSS, SQL Injection koruması)
- Rate limiting ile spam önleme
- CRON endpoint'leri için Bearer token koruması
- KVKK ve GDPR uyumlu veri işleme

---

## 🚀 Canlı Demo

🌐 **Web Sitesi:** [https://finalertweb.app](https://finalertweb.app)   
🤖 **Telegram Bot:** [@MyFinAlertBot](https://t.me/MyFinAlertBot)  

---

## 🛠️ Teknoloji Stack

### **Frontend**
- **Framework:** Next.js 15.5.6 (App Router)
- **UI:** React 19 + Tailwind CSS 4.0
- **Animasyonlar:** Framer Motion
- **Dil:** TypeScript

### **Backend**
- **Runtime:** Node.js
- **API:** Next.js API Routes (Serverless)
- **Veritabanı:** PostgreSQL (Production) / SQLite (Development)
- **ORM:** Prisma 6.17.1

### **AI & Data**
- **AI Model:** Google Gemini 2.5 Flash
- **Web Scraping:** Cheerio + Axios
- **RSS Parser:** RSS-Parser

### **E-posta & Bildirimler**
- **SMTP:** Nodemailer (Gmail App Password)
- **Telegram:** Telegram Bot API
- **CRON:** Node-Cron (Development) / External Services (Production)
---

## 📦 Kurulum

### Ön Gereksinimler

- **Node.js:** 20.x veya üzeri
- **npm/yarn:** Paket yöneticisi
- **Git:** Versiyon kontrolü
- **Gmail Hesabı:** App Password ile (SMTP için)
- **Google AI Studio Hesabı:** Gemini API Key için

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/KULLANICI_ADI/finalert.git
cd finalert/web
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Veritabanı (Development - SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Google Gemini AI API Key
# Buradan alın: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# Gmail App Password (16 karakter)
# Nasıl alınır: https://support.google.com/accounts/answer/185833
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"
SMTP_FROM="FinAlert <your_email@gmail.com>"

# Güvenlik Secret'ları (Production'da mutlaka değiştirin!)
CRON_SECRET="your-super-secret-cron-key-32-chars-minimum"
ADMIN_SECRET_KEY="your-super-secret-admin-key-32-chars-minimum"

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_URL="https://t.me/MyFinAlertBot"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3005"
```

### 4. Veritabanını Hazırlayın

```bash
# Prisma Client oluştur
npx prisma generate

# Veritabanı tablolarını oluştur
npx prisma db push

# (Opsiyonel) Prisma Studio ile veritabanını görüntüle
npx prisma studio
```

### 5. Development Sunucusunu Başlatın

```bash
npm run dev
```

🎉 Uygulama şimdi [http://localhost:3005](http://localhost:3005) adresinde çalışıyor!

---

## 🗄️ Veritabanı Şeması

### **Subscriber (Aboneler)**
Kullanıcı kayıtları ve tercihler

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID | Benzersiz kimlik |
| `email` | String (Unique) | Kullanıcı e-postası |
| `categories` | String | İlgilenilen kategoriler: "doviz,altin,borsa" |
| `notificationHour` | Integer (0-23) | Bildirim saati |
| `notificationFrequency` | String | "daily", "twice", "three_times" |
| `isActive` | Boolean | Abonelik durumu |
| `createdAt` | DateTime | Kayıt tarihi |
| `lastSentAt` | DateTime? | Son bülten zamanı |

### **OTP (Doğrulama Kodları)**
E-posta doğrulama için güvenlik kodları

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID | Benzersiz kimlik |
| `email` | String | Kod gönderilen e-posta |
| `code` | String | 6 haneli doğrulama kodu |
| `attempts` | Integer | Yanlış deneme sayısı (max: 3) |
| `expiresAt` | DateTime | Son kullanma tarihi (10 dk) |
| `createdAt` | DateTime | Oluşturma zamanı |

### **NewsCache (Haber Önbelleği)**
Kazınmış haberler ve AI özetleri

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID | Benzersiz kimlik |
| `category` | String | "doviz", "altin", "borsa" |
| `newsTitle` | String | Haber başlığı |
| `newsUrl` | String | Haber linki |
| `summary` | String | AI özeti |
| `createdAt` | DateTime | Kazıma tarihi |

### **MarketData (Piyasa Verileri)**
Anlık döviz, altın ve borsa verileri

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID | Benzersiz kimlik |
| `dataType` | String | "currency", "gold", "stock" |
| `data` | String | JSON formatında veri |
| `source` | String | Veri kaynağı |
| `updatedAt` | DateTime | Son güncelleme |

---

## 📡 API Endpoint'leri

### **Kullanıcı İşlemleri**

#### Kayıt Olma
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "categories": "doviz,altin,borsa",
  "notificationHour": 8,
  "notificationFrequency": "daily"
}
```

#### OTP Gönderme
```http
POST /api/preferences/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Tercihleri Görüntüleme
```http
GET /api/preferences?email=user@example.com&otp=123456
```

#### Tercihleri Güncelleme
```http
PATCH /api/preferences
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "categories": ["doviz", "altin"],
  "notificationHour": 14,
  "notificationFrequency": "twice",
  "isActive": true
}
```

#### Abonelikten Çıkma
```http
DELETE /api/preferences?email=user@example.com&otp=123456
```

### **Admin İşlemleri**

#### Kullanıcı Listesi
```http
GET /api/admin/users
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

#### Kullanıcı Silme
```http
DELETE /api/admin/users
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### İstatistikler
```http
GET /api/admin/stats
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

### **CRON İşlemleri**

#### Veri Güncelleme
```http
GET /api/cron/update-data
Authorization: Bearer YOUR_CRON_SECRET
```

#### Bülten Gönderme
```http
GET /api/cron/send-bulletins?hour=8
Authorization: Bearer YOUR_CRON_SECRET
```

## 📚 Proje Yapısı

```
web/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Ana sayfa
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global stiller
│   ├── admin/               # Admin panel
│   │   └── page.tsx         # Kullanıcı yönetimi
│   ├── preferences/         # Tercih yönetimi
│   │   └── page.tsx         # OTP ile giriş
│   └── api/                 # Backend API routes
│       ├── subscribe/       # Kayıt endpoint'i
│       ├── preferences/     # Tercih CRUD + OTP
│       ├── send-emails/     # Manuel e-posta gönderme
│       └── cron/            # Zamanlanmış işler
│           ├── update-data/ # Veri güncelleme
│           └── send-bulletins/ # Bülten gönderme
│
├── components/              # React bileşenleri
│   ├── HeroSection.tsx     # Başlık bölümü
│   ├── FeaturesSection.tsx # Özellikler
│   ├── HowItWorks.tsx      # Nasıl çalışır
│   ├── PastBulletins.tsx   # Geçmiş bültenler
│   ├── SignupModal.tsx     # Kayıt formu
│   ├── TelegramBotSection.tsx # Bot tanıtımı
│   └── Footer.tsx          # Footer + Yasal uyarı
│
├── lib/                     # Yardımcı fonksiyonlar
│   ├── prisma.ts           # Veritabanı bağlantısı
│   ├── scrapers.ts         # Veri kazıma
│   ├── emailService.ts     # E-posta gönderimi
│   ├── gemini.ts           # Google AI
│   ├── ai.ts               # AI özet oluşturma
│   ├── otp.ts              # OTP sistemi
│   ├── sanitize.ts         # Input sanitization
│   ├── cron.ts             # CRON jobs
│   └── dataCache.ts        # Veri önbellekleme
│
├── prisma/                  # Veritabanı
│   ├── schema.prisma       # Şema tanımları
│   ├── dev.db              # SQLite (development)
│   └── migrations/         # Migration geçmişi
│
├── public/                  # Statik dosyalar
│
├── .env.example            # Ortam değişkenleri şablonu
├── .gitignore              # Git ignore kuralları
├── package.json            # Bağımlılıklar
├── tsconfig.json           # TypeScript ayarları
├── next.config.ts          # Next.js yapılandırması
├── vercel.json             # Vercel deployment
└── README.md               # Bu dosya
```

---

## 🔐 Güvenlik

### Uygulanan Güvenlik Önlemleri

✅ **Input Sanitization:** XSS ve SQL Injection koruması  
✅ **Rate Limiting:** IP bazlı istek limitleme (5 req/min OTP için)  
✅ **OTP Authentication:** E-posta doğrulama ile güvenli tercih yönetimi  
✅ **Bearer Token:** CRON ve Admin endpoint'leri için  
✅ **Environment Variables:** Hassas bilgiler .env dosyasında  
✅ **HTTPS:** Production'da zorunlu SSL/TLS  
✅ **Email Validation:** RFC 5322 uyumlu e-posta kontrolü  
✅ **CORS:** Sadece izin verilen domainlerden erişim  

### Güvenlik Önerileri

1. **Secret'ları düzenli değiştirin:**
```bash
# Güçlü rastgele key oluştur
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Gmail App Password kullanın** (asla normal şifre!)
3. **Rate limiting'i production'da Redis ile yükseltin**
4. **Database backups yapın** (Vercel Postgres otomatik yapar)
5. **Logs'u düzenli kontrol edin** (Vercel Dashboard)

Detaylı güvenlik raporu: [GUVENLIK-RAPORU.md](GUVENLIK-RAPORU.md)

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! 

### Nasıl Katkıda Bulunulur?

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

### Geliştirme Kuralları

- **TypeScript** kullanın
- **ESLint** kurallarına uyun
- **Anlamlı commit mesajları** yazın
- **Test** ekleyin (mümkünse)
- **Dokümantasyon** güncelleyin

---

## 🙏 Teşekkürler

Bu proje şu açık kaynak projelerini kullanmaktadır:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animasyonlar
- [Google Gemini](https://ai.google.dev/) - AI model
- [Nodemailer](https://nodemailer.com/) - E-posta gönderimi
- [Cheerio](https://cheerio.js.org/) - Web scraping

---

## 🗺️ Roadmap

### v1.0 (Mevcut)
- ✅ Çoklu piyasa desteği (Döviz, Altın, Borsa)
- ✅ AI destekli haber özetleme
- ✅ E-posta bildirimleri
- ✅ Telegram bot entegrasyonu
- ✅ OTP ile güvenli tercih yönetimi
- ✅ Admin panel

### v2.0 (Gelecek)
- 🔮 Portfolio takibi
- 🔮 Fiyat alarm sistemi
- 🔮 Teknik analiz grafikleri
- 🔮 Sosyal paylaşım özellikleri
- 🔮 Premium üyelik sistemi

---

## 🖼️ Örnek Çalışma Görüntüleri

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002607.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002703.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002727.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002804.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002823.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/mail.google.com_mail_u_3_.png" width="auto">

--- 

## ⭐ Yıldız Verin!

Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐

---

<div align="center">

**Made with in Türkiye**

[Website](https://finalertweb.app) • [Telegram Bot](https://t.me/MyFinAlertBot) • [Documentation](https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/README.md)

</div>

---
---
---

# 📈 FinAlert - AI-Powered Finance Tracking System

**[🇹🇷 Türkçe](#-finalert---yapay-zeka-destekli-finans-takip-sistemi)** | **[🇬🇧 English](#-finalert---ai-powered-finance-tracking-system)**

---

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748)](https://www.prisma.io/)

> Tracking daily financial markets is now easy! Receive currency, gold, and stock market data with AI-powered summaries via email.
> Developed using TypeScript and React for enhanced type safety, scalability, and maintainability.
---

## 🌟 Features

### 💰 **Multi-Market Support**
- **Currency:** USD, EUR, GBP rates and analysis
- **Gold:** Gram, quarter, half, and full gold prices
- **Stock Market:** BIST 100 index and popular stocks

### 🤖 **AI Integration**
- Smart news summarization with Google Gemini AI
- Complex financial news presented in simple language
- Daily market analysis and trend detection

### 📧 **Personalized Notifications**
- Choose your categories (currency, gold, stock market)
- Set notification time (08:00, 14:00, 20:00)
- Daily, twice, or three times notification options
- Secure preference management with OTP

### 📱 **Telegram Bot Support**
- Instant queries with [@MyFinAlertBot](https://t.me/MyFinAlertBot)
- Command-based quick data access
- Manage notification preferences from Telegram

### 🔒 **Security**
- Email-based OTP (One-Time Password) verification
- Input sanitization (XSS, SQL Injection protection)
- Spam prevention with rate limiting
- Bearer token protection for CRON endpoints
- KVKK and GDPR compliant data processing

---

## 🚀 Live Demo

🌐 **Website:** [https://finalertweb.app](https://finalertweb.app)
🤖 **Telegram Bot:** [@MyFinAlertBot](https://t.me/MyFinAlertBot)

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** Next.js 15.5.6 (App Router)
- **UI:** React 19 + Tailwind CSS 4.0
- **Animations:** Framer Motion
- **Language:** TypeScript

### **Backend**
- **Runtime:** Node.js
- **API:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **ORM:** Prisma 6.17.1

### **AI & Data**
- **AI Model:** Google Gemini 2.5 Flash
- **Web Scraping:** Cheerio + Axios
- **RSS Parser:** RSS-Parser

### **Email & Notifications**
- **SMTP:** Nodemailer (Gmail App Password)
- **Telegram:** Telegram Bot API
- **CRON:** Node-Cron (Development) / External Services (Production)
---

## 📦 Installation

### Prerequisites

- **Node.js:** 20.x or higher
- **npm/yarn:** Package manager
- **Git:** Version control
- **Gmail Account:** With App Password (for SMTP)
- **Google AI Studio Account:** For Gemini API Key

### 1. Clone the Project

```bash
git clone https://github.com/KULLANICI_ADI/finalert.git
cd finalert/web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` file as `.env`:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database (Development - SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Google Gemini AI API Key
# Get it from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# Gmail App Password (16 characters)
# How to get: https://support.google.com/accounts/answer/185833
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"
SMTP_FROM="FinAlert <your_email@gmail.com>"

# Security Secrets (Change in production!)
CRON_SECRET="your-super-secret-cron-key-32-chars-minimum"
ADMIN_SECRET_KEY="your-super-secret-admin-key-32-chars-minimum"

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_URL="https://t.me/MyFinAlertBot"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3005"
```

### 4. Prepare Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) View database with Prisma Studio
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 The application is now running at [http://localhost:3005](http://localhost:3005)!

---

## 🗄️ Database Schema

### **Subscriber (Subscribers)**
User registrations and preferences

| Field | Type | Description |
|------|-----|----------|
| `id` | UUID | Unique identifier |
| `email` | String (Unique) | User email |
| `categories` | String | Interested categories: "doviz,altin,borsa" |
| `notificationHour` | Integer (0-23) | Notification hour |
| `notificationFrequency` | String | "daily", "twice", "three_times" |
| `isActive` | Boolean | Subscription status |
| `createdAt` | DateTime | Registration date |
| `lastSentAt` | DateTime? | Last bulletin time |

### **OTP (Verification Codes)**
Security codes for email verification

| Field | Type | Description |
|------|-----|----------|
| `id` | UUID | Unique identifier |
| `email` | String | Email that received the code |
| `code` | String | 6-digit verification code |
| `attempts` | Integer | Failed attempt count (max: 3) |
| `expiresAt` | DateTime | Expiration date (10 min) |
| `createdAt` | DateTime | Creation time |

### **NewsCache (News Cache)**
Scraped news and AI summaries

| Field | Type | Description |
|------|-----|----------|
| `id` | UUID | Unique identifier |
| `category` | String | "doviz", "altin", "borsa" |
| `newsTitle` | String | News headline |
| `newsUrl` | String | News link |
| `summary` | String | AI summary |
| `createdAt` | DateTime | Scraping date |

### **MarketData (Market Data)**
Real-time currency, gold, and stock data

| Field | Type | Description |
|------|-----|----------|
| `id` | UUID | Unique identifier |
| `dataType` | String | "currency", "gold", "stock" |
| `data` | String | Data in JSON format |
| `source` | String | Data source |
| `updatedAt` | DateTime | Last update |

---

## 📡 API Endpoints

### **User Operations**

#### Registration
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "categories": "doviz,altin,borsa",
  "notificationHour": 8,
  "notificationFrequency": "daily"
}
```

#### Send OTP
```http
POST /api/preferences/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### View Preferences
```http
GET /api/preferences?email=user@example.com&otp=123456
```

#### Update Preferences
```http
PATCH /api/preferences
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "categories": ["doviz", "altin"],
  "notificationHour": 14,
  "notificationFrequency": "twice",
  "isActive": true
}
```

#### Unsubscribe
```http
DELETE /api/preferences?email=user@example.com&otp=123456
```

### **Admin Operations**

#### User List
```http
GET /api/admin/users
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

#### Delete User
```http
DELETE /api/admin/users
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Statistics
```http
GET /api/admin/stats
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

### **CRON Operations**

#### Data Update
```http
GET /api/cron/update-data
Authorization: Bearer YOUR_CRON_SECRET
```

#### Send Bulletins
```http
GET /api/cron/send-bulletins?hour=8
Authorization: Bearer YOUR_CRON_SECRET
```

## 📚 Project Structure

```
web/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── admin/               # Admin panel
│   │   └── page.tsx         # User management
│   ├── preferences/         # Preference management
│   │   └── page.tsx         # OTP login
│   └── api/                 # Backend API routes
│       ├── subscribe/       # Registration endpoint
│       ├── preferences/     # Preference CRUD + OTP
│       ├── send-emails/     # Manual email sending
│       └── cron/            # Scheduled tasks
│           ├── update-data/ # Data update
│           └── send-bulletins/ # Bulletin sending
│
├── components/              # React components
│   ├── HeroSection.tsx     # Hero section
│   ├── FeaturesSection.tsx # Features
│   ├── HowItWorks.tsx      # How it works
│   ├── PastBulletins.tsx   # Past bulletins
│   ├── SignupModal.tsx     # Registration form
│   ├── TelegramBotSection.tsx # Bot introduction
│   └── Footer.tsx          # Footer + Legal notice
│
├── lib/                     # Helper functions
│   ├── prisma.ts           # Database connection
│   ├── scrapers.ts         # Data scraping
│   ├── emailService.ts     # Email sending
│   ├── gemini.ts           # Google AI
│   ├── ai.ts               # AI summary generation
│   ├── otp.ts              # OTP system
│   ├── sanitize.ts         # Input sanitization
│   ├── cron.ts             # CRON jobs
│   └── dataCache.ts        # Data caching
│
├── prisma/                  # Database
│   ├── schema.prisma       # Schema definitions
│   ├── dev.db              # SQLite (development)
│   └── migrations/         # Migration history
│
├── public/                  # Static files
│
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript settings
├── next.config.ts          # Next.js configuration
├── vercel.json             # Vercel deployment
└── README.md               # This file
```

---

## 🔐 Security

### Implemented Security Measures

✅ **Input Sanitization:** XSS and SQL Injection protection
✅ **Rate Limiting:** IP-based request limiting (5 req/min for OTP)
✅ **OTP Authentication:** Secure preference management with email verification
✅ **Bearer Token:** For CRON and Admin endpoints
✅ **Environment Variables:** Sensitive information in .env file
✅ **HTTPS:** Mandatory SSL/TLS in production
✅ **Email Validation:** RFC 5322 compliant email validation
✅ **CORS:** Access only from allowed domains

### Security Recommendations

1. **Change secrets regularly:**
```bash
# Generate strong random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Use Gmail App Password** (never normal password!)
3. **Upgrade rate limiting with Redis in production**
4. **Make database backups** (Vercel Postgres does it automatically)
5. **Check logs regularly** (Vercel Dashboard)

Detailed security report: [GUVENLIK-RAPORU.md](GUVENLIK-RAPORU.md)

---

## 🤝 Contributing

We welcome your contributions!

### How to Contribute?

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push your branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use **TypeScript**
- Follow **ESLint** rules
- Write **meaningful commit messages**
- Add **tests** (if possible)
- Update **documentation**

---

## 🙏 Acknowledgments

This project uses the following open-source projects:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Google Gemini](https://ai.google.dev/) - AI model
- [Nodemailer](https://nodemailer.com/) - Email sending
- [Cheerio](https://cheerio.js.org/) - Web scraping

---

## 🗺️ Roadmap

### v1.0 (Current)
- ✅ Multi-market support (Currency, Gold, Stock Market)
- ✅ AI-powered news summarization
- ✅ Email notifications
- ✅ Telegram bot integration
- ✅ Secure preference management with OTP
- ✅ Admin panel

### v2.0 (Future)
- 🔮 Portfolio tracking
- 🔮 Price alert system
- 🔮 Technical analysis charts
- 🔮 Social sharing features
- 🔮 Premium membership system

---

## 🖼️ Sample Screenshots

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002607.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002703.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002727.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002804.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-10-24%20002823.png" width="auto">

---

<img src="https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/images/mail.google.com_mail_u_3_.png" width="auto">

---

## ⭐ Give a Star!

If you liked this project, don't forget to give it a star! ⭐

---

<div align="center">

**Made with in Türkiye**

[Website](https://finalertweb.app) • [Telegram Bot](https://t.me/MyFinAlertBot) • [Documentation](https://github.com/mustafaatakli/AI-Destekli-Web-Finans-Sistemi/blob/main/README.md)

</div>
