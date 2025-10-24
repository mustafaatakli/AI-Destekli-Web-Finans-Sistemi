'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PreferencesPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'otp' | 'preferences'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // OTP state
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  // Mevcut tercihler
  const [currentData, setCurrentData] = useState<any>(null)
  
  // Form state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [notificationHour, setNotificationHour] = useState(21)
  const [notificationFrequency, setNotificationFrequency] = useState<'daily' | 'twice' | 'three_times'>('daily')
  const [isActive, setIsActive] = useState(true)

  const categories = [
    { value: 'doviz', label: '💵 Döviz', color: 'green' },
    { value: 'altin', label: '💰 Altın', color: 'yellow' },
    { value: 'borsa', label: '📈 Borsa', color: 'blue' },
  ]

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Send OTP
      const response = await fetch('/api/preferences/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı bulunamadı')
      }

      setOtpSent(true)
      setStep('otp')
      setResendTimer(60) // 60 saniye bekle
      setSuccess('Doğrulama kodu e-posta adresinize gönderildi')
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/preferences?email=${encodeURIComponent(email)}&otp=${otpCode}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Doğrulama başarısız')
      }

      const data = await response.json()
      setCurrentData(data)
      setSelectedCategories(data.categories)
      setNotificationHour(data.notificationHour)
      setNotificationFrequency(data.notificationFrequency)
      setIsActive(data.isActive)
      setStep('preferences')
      setSuccess('Doğrulama başarılı!')
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (selectedCategories.length === 0) {
      setError('En az bir kategori seçmelisiniz')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otpCode,
          categories: selectedCategories,
          notificationHour,
          notificationFrequency,
          isActive
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Güncelleme başarısız')
      }

      setSuccess('Tercihleriniz başarıyla güncellendi!')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      console.error('Tercih güncelleme hatası:', err)
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!confirm('Aboneliğinizi iptal etmek istediğinizden emin misiniz?')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/preferences?email=${encodeURIComponent(email)}&otp=${otpCode}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Abonelik iptali başarısız')
      }

      alert('Aboneliğiniz başarıyla iptal edildi.')
      setStep('email')
      setEmail('')
      setOtpCode('')
      setCurrentData(null)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/preferences/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kod gönderilemedi')
      }

      setResendTimer(60)
      setSuccess('Yeni doğrulama kodu gönderildi')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              ⚙️ Bildirim Tercihlerim
            </h1>
            <p className="text-gray-400">
              {step === 'email' && 'E-posta adresinizle giriş yapın'}
              {step === 'otp' && 'E-postanıza gönderilen doğrulama kodunu girin'}
              {step === 'preferences' && 'Bildirim tercihlerinizi yönetin'}
            </p>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
            >
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="ornek@email.com"
                    required
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    📧 Size doğrulama kodu göndereceğiz
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Gönderiliyor...' : '📨 Doğrulama Kodu Gönder'}
                </button>
              </form>
            </motion.div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
            >
              <div className="mb-6 pb-6 border-b border-slate-700">
                <p className="text-gray-400">Kod gönderilen e-posta:</p>
                <p className="text-white font-semibold">{email}</p>
                <button
                  onClick={() => {
                    setStep('email')
                    setOtpCode('')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  ← Farklı e-posta kullan
                </button>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Doğrulama Kodu
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="w-full px-4 py-4 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    🔒 E-postanıza gönderilen 6 haneli kodu girin
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg text-sm">
                  ⏰ Kod 10 dakika geçerlidir
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Doğrulanıyor...' : '✓ Kodu Doğrula'}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-gray-400 text-sm">
                      Yeni kod gönderimi: {resendTimer} saniye
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-blue-400 hover:text-blue-300 text-sm font-semibold disabled:opacity-50"
                    >
                      🔄 Yeni Kod Gönder
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* Preferences Step */}
          {step === 'preferences' && currentData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
            >
              <div className="mb-6 pb-6 border-b border-slate-700">
                <p className="text-gray-400">Giriş yapılan hesap:</p>
                <p className="text-white font-semibold">{email}</p>
                <button
                  onClick={() => {
                    setStep('email')
                    setEmail('')
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  ← Farklı hesap
                </button>
              </div>

              <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                {/* Active Status */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-white font-semibold block">Bildirimler Aktif</span>
                      <span className="text-sm text-gray-400">Bildirimleri {isActive ? 'devre dışı' : 'aktif'} et</span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    İlgilendiğiniz Kategoriler
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedCategories.includes(cat.value)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-white font-semibold">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification Hour */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Bildirim Saati
                  </label>
                  <select
                    value={notificationHour}
                    onChange={(e) => setNotificationHour(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notification Frequency */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Bildirim Sıklığı
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 bg-slate-900/50 rounded-lg border-2 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
                      <input
                        type="radio"
                        name="frequency"
                        value="daily"
                        checked={notificationFrequency === 'daily'}
                        onChange={(e) => setNotificationFrequency('daily')}
                        className="mr-3"
                      />
                      <div>
                        <span className="text-white font-semibold">Günde 1 Bülten</span>
                        <p className="text-sm text-gray-400">Seçtiğiniz saatte tek bülten</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-slate-900/50 rounded-lg border-2 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
                      <input
                        type="radio"
                        name="frequency"
                        value="twice"
                        checked={notificationFrequency === 'twice'}
                        onChange={(e) => setNotificationFrequency('twice')}
                        className="mr-3"
                      />
                      <div>
                        <span className="text-white font-semibold">Günde 2 Bülten</span>
                        <p className="text-sm text-gray-400">Sabah 08:00 ve akşam seçtiğiniz saatte</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-slate-900/50 rounded-lg border-2 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
                      <input
                        type="radio"
                        name="frequency"
                        value="three_times"
                        checked={notificationFrequency === 'three_times'}
                        onChange={(e) => setNotificationFrequency('three_times')}
                        className="mr-3"
                      />
                      <div>
                        <span className="text-white font-semibold">Günde 3 Bülten</span>
                        <p className="text-sm text-gray-400">Sabah, öğle ve akşam bildirim alın</p>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Kaydediliyor...' : '✓ Değişiklikleri Kaydet'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="w-full bg-red-500/10 border border-red-500 text-red-400 py-3 rounded-lg font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  Abonelikten Çık
                </button>

                <a
                  href="/"
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                  Ana Sayfaya Dön
                </a>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
