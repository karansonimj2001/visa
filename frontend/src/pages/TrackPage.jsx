import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackApplication } from '../api/applications'

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">shield</span>
          </div>
          <div>
            <span className="font-bold text-xl text-blue-900">DUBAI VISA</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Services Portal</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="px-4 py-2 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-blue-50 transition-colors font-medium">Home</Link>
          <Link to="/track" className="px-4 py-2 rounded-lg bg-blue-100 text-blue-900 font-semibold">Track</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden md:inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg">
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-blue-200">
        <p>256-bit SSL Encrypted | Secure Application Process | 24/7 Support Hotline (+971 4 000 0000)</p>
        <p className="mt-2 text-blue-300">© 2025 Dubai Visa Services Portal.</p>
      </div>
    </footer>
  )
}

export default function TrackPage() {
  const [ref, setRef] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    const trimmed = ref.trim()
    if (!trimmed) {
      setError('Please enter your reference number (e.g. DXB-2026-000123).')
      return
    }
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await trackApplication(trimmed)
      setData(res.data)
    } catch (err) {
      setError(err.message || 'Application not found')
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (s) => {
    if (s === 'approved') return 'bg-green-100 text-green-800'
    if (s === 'rejected') return 'bg-red-100 text-red-800'
    if (s === 'under_review') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <Header />
      <main className="pt-28 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-900 transition-colors">
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Home</span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-gray-400">chevron_right</span>
            <span className="text-gray-900 font-semibold">Track Application</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Track Your Application</h1>
          <p className="text-gray-600 mb-8">Enter the reference number you received after submitting (e.g. DXB-2026-000123).</p>

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="DXB-2026-000123"
                className="flex-1 px-4 py-3 bg-gray-50 text-blue-900 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </form>
            {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
          </div>

          {data && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-blue-900">Application Status</h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(data.status)}`}>{data.status}</span>
              </div>
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500">Reference:</span> <span className="font-mono font-bold text-blue-900">{data.reference_number}</span></p>
                <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{data.full_name}</span></p>
                <p><span className="text-gray-500">Visa:</span> <span className="font-semibold">{data.visa_type}</span></p>
                <p><span className="text-gray-500">Payment:</span> <span className="font-semibold">{data.payment_status}</span></p>
                <p><span className="text-gray-500">Submitted:</span> <span className="font-semibold">{new Date(data.created_at).toLocaleDateString()}</span></p>
              </div>
              <Link to="/" className="mt-6 inline-block text-blue-600 font-medium hover:underline">Back to Home</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
