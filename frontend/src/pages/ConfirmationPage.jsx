import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { trackApplication } from '../api/applications'

export default function ConfirmationPage() {
  const { referenceNumber } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [receiptStatus, setReceiptStatus] = useState('idle') // idle, preparing, ready

  useEffect(() => {
    trackApplication(referenceNumber)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [referenceNumber])

  const copyReference = async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.reference_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Reference copied: ' + data.reference_number)
    }
  }

  const handleDownloadReceipt = (e) => {
    const btn = e.currentTarget
    const originalHTML = btn.innerHTML
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">progress_activity</span>Preparing...'
    btn.disabled = true
    setTimeout(() => {
      btn.innerHTML = '<span class="material-symbols-outlined mr-2">check_circle</span>Receipt Ready!'
      btn.classList.remove('bg-secondary', 'hover:bg-secondary/90')
      btn.classList.add('bg-green-600', 'hover:bg-green-700')
      setTimeout(() => {
        btn.innerHTML = originalHTML
        btn.classList.remove('bg-green-600', 'hover:bg-green-700')
        btn.classList.add('bg-secondary', 'hover:bg-secondary/90')
        btn.disabled = false
      }, 2500)
    }, 1500)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading your application...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-600 text-xl mb-4">Application not found</p>
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  )

  const ref = data.reference_number || referenceNumber
  const status = data.status || 'pending'
  const paymentStatus = data.payment_status || 'unpaid'
  const visaType = data.visa_type || 'Visa'
  const fullName = data.full_name || 'Applicant'
  const createdAt = data.created_at ? new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800'
  }

  const paymentColors = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Header */}
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
            <Link to="/track" className="px-4 py-2 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-blue-50 transition-colors font-medium">Track</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/apply" className="hidden md:inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg">
              <span className="material-symbols-outlined">send</span>
              <span>Apply Now</span>
            </a>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-700">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          {/* Success Hero */}
          <section className="mb-12">
            <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
              {/* Animated Checkmark */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 blur-2xl scale-150 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-xl relative">
                  <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white shadow-inner">
                    <span className="material-symbols-outlined text-[34px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  </div>
                </div>
              </div>
              
              {/* Live Sync Badge */}
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1 rounded-full mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
                <span className="text-xs font-semibold tracking-wider text-blue-900 uppercase">Application Received</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900 tracking-tight mb-2">
                Application Submitted Successfully
              </h1>
              <p className="text-gray-600 text-lg max-w-lg mx-auto">
                Your visa application has been received. Our team will verify your documents and submit it to the UAE immigration authorities.
              </p>
            </div>
          </section>

          {/* Reference Code Card */}
          <section className="mb-10">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                <span className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-blue-700">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">fingerprint</span>
                  Your Application Reference
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-3xl md:text-4xl font-bold text-blue-900 bg-gray-50 px-4 py-2 rounded-lg select-all select-all" id="refCode">{data.reference_number || referenceNumber}</span>
                  <button 
                    className="group relative flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95 text-blue-700"
                    onClick={copyReference}
                    title="Copy Reference ID"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">content_copy</span>
                    <span className={`absolute -top-8 left-1/2 -translate-x-1/2 transition-opacity bg-blue-900 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap ${copied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} id="copyTooltip">
                      {copied ? 'Copied!' : 'Copy Reference'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[20px] text-gray-600">timelapse</span>
                  <div className="text-left">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Clearance Window</span>
                    <span className="font-semibold text-blue-900 block">SLA: 24–48 Hours</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2.5 rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span className="font-semibold text-sm tracking-wide">Processing Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Summary & Timeline */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Application Details Card */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-[22px]">badge</span>
                    <h2 className="text-xl font-bold text-blue-900">Dossier Specifications</h2>
                  </div>
                  <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded text-gray-600 font-medium">Secured Record</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="flex flex-col bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Primary Applicant</span>
                    <span className="font-semibold text-blue-900 text-lg">{data.full_name || 'Applicant'}</span>
                    <span className="text-gray-500 text-xs mt-1">Status: {data.status} | Payment: {data.payment_status}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Visa Classification</span>
                    <span className="font-semibold text-blue-900 text-lg">{data.visa_type || 'Visa'}</span>
                    <span className="text-gray-500 text-xs mt-0.5">Valid for entry at any UAE Air/Sea/Land Port</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Payment Status</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-900">{data.payment_status}</span>
                    </div>
                    <span className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-green-600">lock</span>
                      Amount is charged server-side from official pricing
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">Lodgement Timestamp</span>
                    <span className="font-semibold text-blue-900">{new Date(data.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="text-gray-500 text-xs mt-0.5">Gulf Standard Time (UTC +4)</span>
                  </div>
                </div>
                
                {/* Status Banner */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-sm text-gray-700">
                  <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">mark_email_read</span>
                  <div>
                    <p className="font-medium text-gray-900">Save your reference number — you will need it to track your application.</p>
                    <p className="text-gray-500 text-xs mt-0.5">Check your status anytime on the Track page.</p>
                  </div>
                </div>
              </section>

              {/* Timeline */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-8 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-[22px]">hub</span>
                    <h2 className="text-xl font-bold text-blue-900">What Happens Next</h2>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Milestone Timeline</span>
                </div>
                <div className="relative flex flex-col md:flex-row justify-between gap-8">
                  <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-gray-200 -z-0"></div>
                  
                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col md:flex-col items-start md:items-center text-left md:text-center flex-1 gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined text-[24px]">done_all</span>
                    </div>
                    <div className="flex flex-col text-center md:text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-700">Step 1 • Completed</span>
                      <h3 className="text-lg font-bold text-blue-900 mt-1">Application & Payment</h3>
                      <p className="text-gray-600 text-sm mt-1">Form submitted and payment received securely via Razorpay.</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-col items-start md:items-center text-center flex-1 gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-lg shrink-0">
                      <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Step 2 • Active Stage</span>
                      <h3 className="text-lg font-bold text-blue-900 mt-1">Document Verification</h3>
                      <p className="text-gray-600 text-sm mt-1">Our team is checking your documents before submission.</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 opacity-60 flex flex-col items-center text-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[24px]">send</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Step 3 • Issuance</span>
                      <h3 className="text-lg font-bold text-blue-900 mt-1">Decision & Delivery</h3>
                      <p className="text-gray-600 text-sm mt-1">Once approved, your e-Visa details are shared with you.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Actions Card */}
              <section className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-xl font-bold text-blue-900">Next Actions</h3>
                <p className="text-gray-600 text-sm">
                  Keep your reference handy to inspect legal clearance checkpoints anytime.
                </p>
                
                <Link 
                  to={`/track?ref=${data.reference_number || referenceNumber}`}
                  className="w-full py-4 px-6 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">radar</span>
                  <span>Track Your Application</span>
                </Link>
                
                <button
                  className="w-full py-4 px-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-900 font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  onClick={() => {
                    const lines = [
                      'Dubai Visa Application Receipt',
                      '================================',
                      `Reference : ${data.reference_number || referenceNumber}`,
                      `Name      : ${data.full_name || ''}`,
                      `Visa      : ${data.visa_type || ''}`,
                      `Status    : ${data.status || ''}`,
                      `Payment   : ${data.payment_status || ''}`,
                      `Submitted : ${data.created_at ? new Date(data.created_at).toLocaleString() : ''}`,
                    ]
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `receipt-${data.reference_number || referenceNumber}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <span className="material-symbols-outlined mr-2">receipt_long</span>
                  <span>Download Receipt</span>
                </button>
              </section>

              {/* Travel Checklist Card */}
              <section className="relative bg-blue-900 text-white rounded-2xl p-8 shadow-lg overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Before You Fly</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <h4 className="text-xl font-bold mt-2">Travel Checklist</h4>
                  <ul className="text-blue-200 mt-2 text-sm space-y-1.5">
                    <li>• Passport valid 6+ months beyond entry date</li>
                    <li>• Confirmed return / onward ticket</li>
                    <li>• Reference number saved for tracking</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-700">
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-300">Need help?</span>
                    <span className="font-semibold text-xs">Contact support anytime</span>
                  </div>
                  <span className="material-symbols-outlined text-amber-300 text-[28px]">support_agent</span>
                </div>
              </section>

              {/* Support Banner */}
              <section className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[28px]">support_agent</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Need to fix something in your application?</h3>
                    <p className="text-gray-600 text-sm">
                      Our support team operates 24/7 for name corrections, document re-uploads, and application questions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a href="tel:+97140000000" className="inline-flex items-center gap-2 bg-gray-50 text-blue-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">call</span>
                    <span>+971 4 000 0000</span>
                  </a>
                  <a href="/support" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Live Chat</span>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">shield</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">Dubai Visa Services</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">Online visa application assistance for UAE travel — we prepare, verify and submit your application.</p>
              <div className="flex items-center gap-2 text-blue-200 text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-green-400">check_circle</span>
                <span>Secure SSL-Encrypted Service</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-300 mb-4">Quick Visa Links</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="/visa-types" className="hover:text-white transition-colors">30-Day Single Entry Tourist Visa</a></li>
                <li><a href="/visa-types" className="hover:text-white transition-colors">60-Day Multiple Entry Visa</a></li>
                <li><a href="/visa-types" className="hover:text-white transition-colors">48-Hour & 96-Hour Transit Visa</a></li>
                <li><a href="/visa-types" className="hover:text-white transition-colors">GCC Residents Special Entry</a></li>
                <li><a href="/visa-types" className="hover:text-white transition-colors">Urgent Express Processing (4-Hour)</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-300 mb-4">Verification & Tools</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="/track" className="hover:text-white transition-colors">Application Status Lookup</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Visa Types & Pricing</a></li>
                <li><a href="/track" className="hover:text-white transition-colors">Document Guidelines</a></li>
                <li><a href="/" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-300 mb-4">Legal & Trust</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="/" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Refund & Cancellation Policy</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Secure Payment Info</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-blue-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-green-400">lock</span><span className="font-semibold text-white">256-bit SSL Encrypted</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-green-400">verified</span><span className="font-semibold text-white">Secure Application Process</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-amber-400">call</span><span className="font-semibold text-white">24/7 Support Hotline (+971 4 000 0000)</span></div>
            </div>
            <p className="text-blue-300">© 2025 Dubai Visa Services Portal. Visa application assistance service.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}