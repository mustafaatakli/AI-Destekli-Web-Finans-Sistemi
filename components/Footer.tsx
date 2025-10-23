'use client'

import { useState } from 'react'

export default function Footer() {
  const [showLegal, setShowLegal] = useState(false)

  return (
    <>
      <footer className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white py-12 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              FinAlert
            </h3>
            <p className="text-gray-400 text-center">
              Yapay zeka destekli günlük finans haberleri ve piyasa verileri
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-4">Hizmetler</h4>
            <ul className="space-y-2 text-gray-400 text-center">
              <li>
                <a 
                  href="/#past-bulletins" 
                  className="hover:text-white transition-colors"
                >
                  Günlük Haber Özetleri
                </a>
              </li>
              <li>
                <a 
                  href="/#features" 
                  className="hover:text-white transition-colors"
                >
                  Anlık Piyasa Verileri
                </a>
              </li>
              <li>
                <a 
                  href="/#how-it-works" 
                  className="hover:text-white transition-colors"
                >
                  E-posta Bildirimleri
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/MyFinAlertBot" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 justify-center"
                >
                  Telegram Botu
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="/preferences" 
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2 justify-center group"
                >
                  <svg 
                    className="w-4 h-4 group-hover:rotate-12 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  Tercihlerimi Değiştir
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400 text-center">
              <li>finalertnoreply@gmail.com</li>
              <li>
                <button 
                  onClick={() => setShowLegal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowLegal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kullanım Şartları
                </button>
              </li>
              <li>
                <a 
                  href="/admin" 
                  className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2 justify-center group"
                >
                  <svg 
                    className="w-4 h-4 group-hover:rotate-12 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>
        </div>          <div className="border-t border-gray-800/50 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FinAlert. Tüm hakları saklıdır.</p>
            <p className="text-sm mt-2">Made with in Türkiye</p>
          </div>
        </div>
      </footer>

      {/* Legal Notice Modal */}
      {showLegal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLegal(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">📜 Yasal Uyarı ve Gizlilik Politikası</h2>
              <button 
                onClick={() => setShowLegal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">Son Güncelleme: 22 Ekim 2025</p>
              
              <p className="leading-relaxed">
                Lütfen web sitemizi kullanmadan önce bu metni dikkatlice okuyunuz. FinAlert Web Finans Takip Sistemi'ni ("Site") kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Genel Bilgilendirme ve Amaç</h3>
                  <p className="leading-relaxed">
                    FinAlert, finansal verileri ve haberleri sunmak amacıyla geliştirilmiş bir bilgilendirme ve demo platformudur. Bu Sitede yer alan tüm içerik, veri ve hizmetler yalnızca test, eğitim ve kişisel gelişim amaçlıdır. Sunulan bilgilerin kullanımı herhangi bir ticari amaç taşımamaktadır.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Yatırım Tavsiyesi Değildir</h3>
                  <p className="leading-relaxed">
                    Sitede yer alan hiçbir bilgi, yorum, analiz veya veri, Sermaye Piyasası mevzuatı kapsamında bir yatırım tavsiyesi değildir. Bu içerikler, belirli bir getiri sağlamak amacıyla sunulmamaktadır ve yatırım danışmanlığı faaliyeti kapsamında değerlendirilemez. Finansal kararlarınızı almadan önce mutlaka yetkili bir finans uzmanına danışmalısınız.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Veri Kaynakları ve Sorumluluğun Reddi</h3>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Sitemizde kullanılan finansal veriler ve haberler, üçüncü taraf web sitelerinden ve halka açık kaynaklardan derlenmektedir.</li>
                    <li>Bu verilerin doğruluğu, güncelliği veya eksiksizliği konusunda herhangi bir garanti verilmemektedir. Veri kaynaklarında yaşanabilecek kesinti, gecikme veya hatalardan sitemiz sorumlu değildir.</li>
                    <li>Bu sitedeki bilgilere dayanarak alınacak kararlardan doğabilecek hiçbir maddi veya manevi zarardan web sitesi geliştiricisi sorumlu tutulamaz.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">4. Gizlilik Politikası</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">a. Kişisel Verilerin Toplanması:</h4>
                      <p className="leading-relaxed">
                        Sitemize e-posta bülteni aboneliği için kaydolduğunuzda, e-posta adresiniz gibi kişisel verileriniz toplanmaktadır.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">b. Verilerin Kullanım Amacı:</h4>
                      <p className="leading-relaxed">
                        Toplanan e-posta adresleri, yalnızca size döviz, altın ve finans haberleri içeren bültenleri göndermek amacıyla kullanılır. Bu veriler, yasal zorunluluklar dışında, izniniz olmaksızın hiçbir üçüncü tarafla paylaşılmaz veya ticari amaçlarla satılmaz.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">c. Abonelikten Ayrılma:</h4>
                      <p className="leading-relaxed">
                        Bültenlerimizi almak istemiyorsanız, size gönderilen her e-postanın altında bulunan "Abonelikten Ayrıl" bağlantısını kullanarak istediğiniz zaman listeden kolayca çıkabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-8">
                <p className="text-blue-300 text-center">
                  Bu metni okuyup anladığınız için teşekkür ederiz.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700 text-center">
              <button 
                onClick={() => setShowLegal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
