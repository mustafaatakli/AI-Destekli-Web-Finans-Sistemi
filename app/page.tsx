'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import HowItWorks from '@/components/HowItWorks'
import TelegramBotSection from '@/components/TelegramBotSection'
import PastBulletins from '@/components/PastBulletins'
import SignupModal from '@/components/SignupModal'
import Footer from '@/components/Footer'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen">
      <HeroSection onSignupClick={() => setIsModalOpen(true)} />
      <FeaturesSection />
      <HowItWorks />
      <TelegramBotSection />
      <PastBulletins onSignupClick={() => setIsModalOpen(true)} />

      <section className="py-20 px-4 bg-purple-100 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-purple-900 mb-6"
          >
            Bugün Başlayın
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-purple-700 mb-8"
          >
            Günlük finans haberlerini yapay zeka ile özetlenmiş şekilde e-postanızda alın
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Ücretsiz Başla
          </motion.button>
        </div>
      </section>

      <Footer />
      <SignupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
