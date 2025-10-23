'use client'

import { motion } from 'framer-motion'

export default function TelegramBotSection() {
  const telegramBotUrl = 'https://t.me/MyFinAlertBot'

  return (
    <section className="py-20 px-4 bg-purple-100 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 shadow-xl border border-purple-300/30"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-14 h-14 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.093.036.305.02.469z"/>
                </svg>
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                FinAlert Telegram Botu
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-blue-100 text-lg mb-6"
              >
                Telegram üzerinden anlık döviz, altın ve borsa verilerine ulaşın.
                Portföy takibi yapın, fiyat uyarıları oluşturun ve periyodik raporlar alın.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-3 justify-center md:justify-start mb-6"
              >
                {[
                  '💼 Portföy Yönetimi',
                  '🔔 Fiyat Uyarıları',
                  '⏰ Periyodik Raporlar',
                  '📊 Canlı Veriler'
                ].map((feature, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </motion.div>

              <motion.a
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={telegramBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.093.036.305.02.469z"/>
                </svg>
                Telegram Botunu Kullan
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
