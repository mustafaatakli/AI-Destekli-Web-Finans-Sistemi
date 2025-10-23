'use client'

import { motion } from 'framer-motion'

export default function FeaturesSection() {
  const features = [
    {
      icon: '💵',
      title: 'Döviz',
      description: 'USD, EUR, GBP kurları ve döviz piyasası haberleri'
    },
    {
      icon: '🏆',
      title: 'Altın',
      description: 'Gram altın, çeyrek, yarım ve tam altın fiyatları'
    },
    {
      icon: '📈',
      title: 'Borsa',
      description: 'BIST 100 ve popüler hisse senetleri güncel verileri'
    },
    {
      icon: '🎯',
      title: 'Kişiselleştirilmiş',
      description: 'Sadece ilgilendiğiniz kategorilerden haber alın'
    },
    {
      icon: '⏰',
      title: 'Esnek Zamanlama',
      description: 'Günde 1, 2 veya 3 kez bildirim alabilirsiniz'
    },
    {
      icon: '🔒',
      title: 'Güvenli',
      description: 'E-posta adresiniz güvende, spam yok'
    }
  ]

  return (
    <section id="features" className="py-20 px-4 bg-purple-100 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Neler Sunuyoruz?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Finans piyasalarını takip etmek hiç bu kadar kolay olmamıştı
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-purple-200/50"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
