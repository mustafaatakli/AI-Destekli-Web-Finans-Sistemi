'use client'

import { motion } from 'framer-motion'

interface HeroSectionProps {
  onSignupClick: () => void
}

export default function HeroSection({ onSignupClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-400/20 via-transparent to-transparent"></div>

      <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animated-gradient-text"
          >
            FinAlert
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl sm:text-3xl mb-4 font-light"
          >
            Günlük Piyasa Özetiniz
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl mb-8 text-purple-100 max-w-2xl mx-auto"
          >
            Yapay zeka ile özetlenmiş finans haberleri ve anlık piyasa verileri, her gün e-postanızda
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignupClick}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all w-full sm:w-auto"
            >
              Ücretsiz Başla
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {[
              { icon: '🌐', title: 'Sayısız Kaynak', desc: 'En güncel finans haberlerini topluyoruz' },
              { icon: '🤖', title: 'Yapay Zeka', desc: 'AI destekli akıllı özetleme' },
              { icon: '📧', title: 'Günlük Teslimat', desc: 'İstediğiniz saatte e-postanızda' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-purple-100">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-purple-100 to-transparent"></div>
    </section>
  )
}
