'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PastBulletinsProps {
  onSignupClick: () => void
}

export default function PastBulletins({ onSignupClick }: PastBulletinsProps) {
  const [selectedBulletin, setSelectedBulletin] = useState<number | null>(null)

  // Mock data for past bulletins
  const bulletins = [
    {
      id: 1,
      date: '21 Ekim 2025',
      title: 'Günlük Finans Özeti - 21 Ekim',
      category: 'Piyasa Analizi',
      preview: 'Dolar/TL paritesinde günün öne çıkan hareketleri, BIST 100 endeksinde yaşanan değişimler ve altın fiyatlarındaki güncel gelişmeler...',
      content: `
        <h3>Döviz Piyasaları</h3>
        <p>Dolar/TL, bugün 34.25 seviyesinde işlem görürken, Euro/TL 36.80'de dengelendi. Merkez Bankası'nın açıklamaları sonrası kurlar hafif gerileme gösterdi.</p>

        <h3>Borsa İstanbul</h3>
        <p>BIST 100 endeksi %1.2 yükselişle 9,850 puandan kapandı. Bankacılık endeksi günün yıldızı olurken, sanayi sektörü geride kaldı.</p>

        <h3>Altın ve Emtialar</h3>
        <p>Gram altın 2,450 TL seviyesinde işlem görüyor. Küresel piyasalardaki belirsizlik altına olan talebi artırıyor.</p>
      `,
      stats: {
        usd: '↑ 34.25',
        bist: '↑ 9,850',
        gold: '→ 2,450'
      }
    },
    {
      id: 2,
      date: '20 Ekim 2025',
      title: 'Günlük Finans Özeti - 20 Ekim',
      category: 'Merkez Bankası',
      preview: 'Merkez Bankası faiz kararı sonrası piyasalardaki hareketlilik, döviz kurlarında yaşanan dalgalanmalar ve borsa yorumları...',
      content: `
        <h3>Merkez Bankası Kararları</h3>
        <p>TCMB, politika faizini %50 seviyesinde sabit tutma kararı aldı. Karar piyasalar tarafından olumlu karşılandı.</p>

        <h3>Piyasa Tepkileri</h3>
        <p>Faiz kararı sonrası borsa yükselişe geçti, döviz kurları geriledi. Yatırımcılar temkinli iyimser.</p>

        <h3>Uzman Görüşleri</h3>
        <p>Ekonomistler, mevcut politikanın enflasyonla mücadelede etkili olabileceğini değerlendiriyor.</p>
      `,
      stats: {
        usd: '↓ 34.10',
        bist: '↑ 9,730',
        gold: '↑ 2,440'
      }
    },
    {
      id: 3,
      date: '19 Ekim 2025',
      title: 'Günlük Finans Özeti - 19 Ekim',
      category: 'Küresel Piyasalar',
      preview: 'Küresel piyasalardaki son gelişmeler, Türkiye ekonomisine etkileri ve yatırım fırsatları hakkında detaylı analizler...',
      content: `
        <h3>Küresel Gelişmeler</h3>
        <p>ABD'de açıklanan ekonomik veriler beklentilerin üzerinde geldi. Fed'in faiz politikasına ilişkin spekülasyonlar artıyor.</p>

        <h3>Türkiye'ye Etkileri</h3>
        <p>Gelişen ülke para birimleri küresel gelişmelerden etkilendi. Türk Lirası nispeten dirençli seyretti.</p>

        <h3>Yatırım Önerileri</h3>
        <p>Uzmanlar, kısa vadede temkinli yaklaşımı, uzun vadede ise seçici hisse alımlarını öneriyor.</p>
      `,
      stats: {
        usd: '→ 34.15',
        bist: '↓ 9,680',
        gold: '↓ 2,425'
      }
    },
    {
      id: 4,
      date: '18 Ekim 2025',
      title: 'Günlük Finans Özeti - 18 Ekim',
      category: 'Haftalık Değerlendirme',
      preview: 'Haftanın özeti: Döviz, altın ve borsa hareketleri, öne çıkan şirketler ve gelecek hafta beklentileri...',
      content: `
        <h3>Haftalık Performans</h3>
        <p>Bu hafta BIST 100 %2.5 yükseldi, dolar/TL %0.8 geriledi. Yatırımcılar kazançlı bir hafta geçirdi.</p>

        <h3>Öne Çıkan Hisseler</h3>
        <p>Bankacılık ve enerji sektörü haftanın yıldızları oldu. Teknoloji hisseleri karışık seyir izledi.</p>

        <h3>Gelecek Hafta</h3>
        <p>Enflasyon verileri ve şirket bilançoları yakından takip edilecek.</p>
      `,
      stats: {
        usd: '↓ 34.05',
        bist: '↑ 9,620',
        gold: '→ 2,430'
      }
    },
    {
      id: 5,
      date: '17 Ekim 2025',
      title: 'Günlük Finans Özeti - 17 Ekim',
      category: 'Şirket Haberleri',
      preview: 'Büyük şirketlerin açıkladığı bilançolar, temettü duyuruları ve stratejik ortaklık haberleri...',
      content: `
        <h3>Şirket Bilançoları</h3>
        <p>Önemli şirketler 3. çeyrek sonuçlarını açıkladı. Genel tablo beklentilerin üzerinde.</p>

        <h3>Temettü Duyuruları</h3>
        <p>Birçok şirket yüksek temettü dağıtımı kararı aldı. Yatırımcılar için olumlu gelişme.</p>

        <h3>Stratejik Hamleler</h3>
        <p>Sektörde yeni birleşme ve satın alma haberleri gündemde.</p>
      `,
      stats: {
        usd: '↑ 34.30',
        bist: '↑ 9,580',
        gold: '↑ 2,455'
      }
    },
    {
      id: 6,
      date: '16 Ekim 2025',
      title: 'Günlük Finans Özeti - 16 Ekim',
      category: 'Teknik Analiz',
      preview: 'Piyasaların teknik görünümü, destek ve direnç seviyeleri, al-sat sinyalleri ve trend analizleri...',
      content: `
        <h3>BIST 100 Teknik Görünüm</h3>
        <p>Endeks 9,500 desteğinin üzerinde kaldığı sürece yükseliş trendi devam edebilir. İlk direnç 10,000 puanda.</p>

        <h3>Döviz Teknikleri</h3>
        <p>Dolar/TL 34.50 direncini aşarsa yukarı yönlü hareket güçlenebilir. Destek 33.80'de.</p>

        <h3>Yatırım Stratejileri</h3>
        <p>Kısa vadeli işlemlerde stop-loss kullanımı öneriliyor. Uzun vade için değer hisseleri takip ediliyor.</p>
      `,
      stats: {
        usd: '→ 34.20',
        bist: '↑ 9,540',
        gold: '↓ 2,420'
      }
    },
  ]

  const selectedBulletinData = bulletins.find(b => b.id === selectedBulletin)

  return (
    <section id="past-bulletins" className="py-20 px-4 bg-purple-100 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Geçmiş Bültenler
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Finans piyasalarını takip etmek hiç bu kadar kolay olmamıştı
          </p>
          <p className="text-lg text-purple-600 font-medium">
            Her gün böyle bir özet e-postanızda olacak
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {bulletins.map((bulletin, index) => (
            <motion.div
              key={bulletin.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-purple-200/50 cursor-pointer group"
              onClick={() => setSelectedBulletin(bulletin.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {bulletin.category}
                </span>
                <span className="text-sm text-gray-500">
                  {bulletin.date}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {bulletin.title}
              </h3>

              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">USD:</span>
                  <span className="font-semibold text-gray-900">{bulletin.stats.usd}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">BIST:</span>
                  <span className="font-semibold text-gray-900">{bulletin.stats.bist}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Altın:</span>
                  <span className="font-semibold text-gray-900">{bulletin.stats.gold}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {bulletin.preview}
              </p>

              <button
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-2 group-hover:gap-3"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBulletin(bulletin.id)
                }}
              >
                Devamını Oku
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignupClick}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Ücretsiz Başla
          </motion.button>
        </motion.div>
      </div>

      {/* Modal for bulletin details */}
      <AnimatePresence>
        {selectedBulletin && selectedBulletinData && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBulletin(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                      {selectedBulletinData.category}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedBulletinData.title}
                    </h2>
                    <p className="text-gray-500">{selectedBulletinData.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedBulletin(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-6 mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600 mb-1">Dolar/TL</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedBulletinData.stats.usd}</div>
                  </div>
                  <div className="flex-1 text-center border-x border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">BIST 100</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedBulletinData.stats.bist}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600 mb-1">Gram Altın</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedBulletinData.stats.gold}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBulletinData.content }}
                  style={{
                    color: '#374151'
                  }}
                />

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 mb-4">
                    Bu tür özetleri her gün e-postanızda almak ister misiniz?
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedBulletin(null)
                      onSignupClick()
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Hemen Kayıt Ol
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
