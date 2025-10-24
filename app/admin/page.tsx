'use client'

import { useState, useEffect } from 'react'

interface Subscriber {
  id: string
  email: string
  categories: string
  notificationHour: number
  notificationFrequency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastSentAt: string | null
}

export default function AdminPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Load admin key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('adminKey')
    if (savedKey) {
      setAdminKey(savedKey)
      setIsAuthenticated(true)
      fetchSubscribers(savedKey)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchSubscribers = async (key: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/subscribers', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      })

      if (response.status === 401) {
        setError('Geçersiz admin anahtarı')
        setIsAuthenticated(false)
        localStorage.removeItem('adminKey')
        return
      }

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setSubscribers(data.subscribers)
      setError('')
    } catch (err) {
      setError('Kullanıcılar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminKey.trim()) {
      localStorage.setItem('adminKey', adminKey)
      setIsAuthenticated(true)
      fetchSubscribers(adminKey)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminKey')
    setAdminKey('')
    setIsAuthenticated(false)
    setSubscribers([])
  }

  const updateSubscriber = async (id: string, updates: Partial<Subscriber>) => {
    try {
      const subscriber = subscribers.find(s => s.id === id)
      if (!subscriber) return

      const response = await fetch('/api/admin/subscribers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          email: subscriber.email,
          ...updates
        })
      })

      if (!response.ok) throw new Error('Update failed')

      await fetchSubscribers(adminKey)
      setEditingId(null)
    } catch (err) {
      alert('Güncelleme başarısız')
    }
  }

  const deleteSubscriber = async (email: string, permanent: boolean) => {
    if (!confirm(permanent ? 'Kalıcı olarak silinecek, emin misiniz?' : 'Deaktif edilecek, emin misiniz?')) {
      return
    }

    try {
      const url = `/api/admin/subscribers?email=${encodeURIComponent(email)}${permanent ? '&permanent=true' : ''}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      })

      if (!response.ok) throw new Error('Delete failed')

      await fetchSubscribers(adminKey)
    } catch (err) {
      alert('İşlem başarısız')
    }
  }

  const resetLastSent = async (email: string) => {
    if (!confirm('Son gönderim sıfırlanacak, kullanıcı hemen bülten alabilecek. Emin misiniz?')) {
      return
    }

    await updateSubscriber(
      subscribers.find(s => s.email === email)?.id || '',
      { lastSentAt: null }
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            🔐 Admin Giriş
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Anahtarı
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Admin secret key..."
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-600 transition"
            >
              Giriş Yap
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p></p>
            <code className="bg-gray-100 px-2 py-1 rounded"></code>
            <p className="mt-2"></p>
          </div>
        </div>
      </div>
    )
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">FinAlert Admin Panel</h1>
              <p className="text-purple-100 mt-1">Kullanıcı Yönetim Sistemi</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchSubscribers(adminKey)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                🔄 Yenile
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                🚪 Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-500 text-sm font-medium">Toplam Kullanıcı</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{subscribers.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-500 text-sm font-medium">Aktif</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {subscribers.filter(s => s.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-500 text-sm font-medium">Pasif</div>
            <div className="text-3xl font-bold text-gray-400 mt-2">
              {subscribers.filter(s => !s.isActive).length}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        ) : (
          /* Subscribers Table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategoriler
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıklık
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscriber.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              Kayıt: {new Date(subscriber.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                            {subscriber.lastSentAt && (
                              <div className="text-xs text-gray-400">
                                Son: {new Date(subscriber.lastSentAt).toLocaleString('tr-TR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {subscriber.categories.split(',').map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscriber.notificationHour.toString().padStart(2, '0')}:00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscriber.notificationFrequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {subscriber.isActive ? '✅ Aktif' : '❌ Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => resetLastSent(subscriber.email)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Son gönderimi sıfırla"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => updateSubscriber(subscriber.id, { isActive: !subscriber.isActive })}
                          className="text-yellow-600 hover:text-yellow-900"
                          title={subscriber.isActive ? 'Deaktif et' : 'Aktif et'}
                        >
                          {subscriber.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber.email, false)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Deaktif et"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber.email, true)}
                          className="text-red-600 hover:text-red-900"
                          title="Kalıcı sil"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {subscribers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Henüz kullanıcı yok
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
