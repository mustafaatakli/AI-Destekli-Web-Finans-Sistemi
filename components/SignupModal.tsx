'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'email' | 'categories' | 'schedule' | 'confirm' | 'success'

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [frequency, setFrequency] = useState('daily')
  const [hour, setHour] = useState(9)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          categories: categories.join(','),
          notificationHour: hour,
          notificationFrequency: frequency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız')
      }

      setStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setCategories([])
    setFrequency('daily')
    setHour(9)
    setError('')
    onClose()
  }

  const categoryOptions = [
    { id: 'doviz', label: 'Döviz', icon: '💵', desc: 'USD, EUR, GBP kurları' },
    { id: 'altin', label: 'Altın', icon: '🏆', desc: 'Altın fiyatları' },
    { id: 'borsa', label: 'Borsa', icon: '📈', desc: 'BIST ve hisse senetleri' }
  ]

  const frequencyOptions = [
    { id: 'daily', label: 'Günde 1 Kez', desc: 'Her gün belirlediğiniz saatte' },
    { id: 'twice', label: 'Günde 2 Kez', desc: 'Sabah ve akşam' },
    { id: 'three_times', label: 'Günde 3 Kez', desc: 'Sabah, öğle ve akşam' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {step === 'success' ? 'Tebrikler!' : 'Kayıt Ol'}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {step !== 'success' && (
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    {['email', 'categories', 'schedule', 'confirm'].map((s, i) => (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`h-2 rounded-full flex-1 transition-colors ${
                          ['email', 'categories', 'schedule', 'confirm'].indexOf(step) >= i
                            ? 'bg-purple-600'
                            : 'bg-gray-200'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-gray-600 mb-6">
                      E-posta adresinizi girin ve günlük finans özetlerine ulaşın
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors mb-6 text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (email && email.includes('@')) {
                          setStep('categories')
                          setError('')
                        } else {
                          setError('Geçerli bir e-posta adresi girin')
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Devam Et
                    </button>
                  </motion.div>
                )}

                {step === 'categories' && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-gray-600 mb-6">
                      Hangi kategorilerden haber almak istersiniz?
                    </p>
                    <div className="space-y-3 mb-6">
                      {categoryOptions.map((category) => (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            categories.includes(category.id)
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{category.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{category.label}</div>
                              <div className="text-sm text-gray-600">{category.desc}</div>
                            </div>
                            {categories.includes(category.id) && (
                              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        Geri
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (categories.length > 0) {
                            setStep('schedule')
                            setError('')
                          } else {
                            setError('En az bir kategori seçin')
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Devam Et
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'schedule' && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-gray-600 mb-6">
                      Bildirim tercihlerinizi ayarlayın
                    </p>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Günde kaç kez bildirim almak istersiniz?
                      </label>
                      <div className="space-y-2">
                        {frequencyOptions.map((freq) => (
                          <button
                            type="button"
                            key={freq.id}
                            onClick={() => setFrequency(freq.id)}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                              frequency === freq.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{freq.label}</div>
                            <div className="text-sm text-gray-600">{freq.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        İlk bildirimi hangi saatte almak istersiniz?
                      </label>
                      <select
                        value={hour}
                        onChange={(e) => setHour(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors text-gray-900"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option key={h} value={h} className="text-black">
                            {h.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('categories')}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        Geri
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('confirm')}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Devam Et
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-gray-600 mb-6">
                      Tercihlerinizi kontrol edin ve onaylayın
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">E-posta</div>
                        <div className="font-semibold text-gray-900">{email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Kategoriler</div>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map(cat => (
                            <span key={cat} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              {categoryOptions.find(c => c.id === cat)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Bildirim Sıklığı</div>
                        <div className="font-semibold text-gray-900">
                          {frequencyOptions.find(f => f.id === frequency)?.label}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">İlk Bildirim Saati</div>
                        <div className="font-semibold text-gray-900">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('schedule')}
                        disabled={isLoading}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                      >
                        Geri
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Kaydediliyor...' : 'Onayla ve Kaydet'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Kayıt Başarılı!
                    </h3>
                    <p className="text-gray-600 mb-8">
                      {email} adresinize yakında ilk finans özetinizi göndereceğiz.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Kapat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && step !== 'confirm' && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
