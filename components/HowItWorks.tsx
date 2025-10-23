'use client'

import { motion } from 'framer-motion'

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'E-posta Girin',
      description: 'Kayıt formuna e-posta adresinizi girin'
    },
    {
      number: '2',
      title: 'Tercihleri Seçin',
      description: 'Döviz, altın veya borsa - ilgilendiğiniz kategorileri seçin'
    },
    {
      number: '3',
      title: 'Zamanlamayı Ayarlayın',
      description: 'Günde kaç kez ve hangi saatlerde bildirim almak istediğinizi belirleyin'
    },
    {
      number: '4',
      title: 'Özet Alın',
      description: 'Yapay zeka destekli haberler ve anlık veriler e-postanızda!'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-purple-100 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nasıl Çalışıyor?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            4 basit adımda günlük finans özetinize ulaşın
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-all h-full border border-pink-200/50">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto"
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg className="w-8 h-8 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
