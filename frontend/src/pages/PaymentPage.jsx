import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { createRazorpayOrder } from '../api/applications'

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function CheckoutPanel({ order, onPaid }) {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handlePay = async () => {
    setError('')
    setInfo('')
    const loaded = await loadRazorpayScript()
    if (!loaded || !window.Razorpay) {
      setError('Payment gateway failed to load. Check your connection and try again.')
      return
    }
    setProcessing(true)
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Dubai Visa Services',
      description: order.visa_name || 'Visa application fee',
      order_id: order.order_id,
      prefill: {
        name: order.full_name || '',
        email: '',
      },
      theme: { color: '#0b1e3d' },
      handler: () => {
        // Payment succeeded on Razorpay's side; the webhook confirms it
        // server-side. Take the user to their confirmation page.
        onPaid(order.reference_number)
        navigate(`/confirmation/${order.reference_number}`)
      },
      modal: {
        ondismiss: () => {
          setProcessing(false)
          setInfo('Payment window closed. No money was charged — you can retry anytime.')
        },
      },
    })
    rzp.on('payment.failed', (resp) => {
      setProcessing(false)
      setError(resp?.error?.description || 'Payment failed. Please try another method.')
    })
    rzp.open()
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Pay Securely</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Cards, UPI, NetBanking & wallets via Razorpay.</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
          <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">lock</span>
          <span>Razorpay Secured</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low mb-6">
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Accepted:</span>
        <div className="flex items-center gap-2">
          {['UPI', 'VISA', 'MC', 'RuPay', 'NB'].map(b => (
            <span key={b} className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary font-mono text-[11px] font-bold shadow-xs">{b}</span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container shadow-sm mb-4">
          <p className="font-bold text-[15px] leading-tight">Payment failed: {error}</p>
          <button type="button" onClick={() => setError('')}
            className="font-label-sm text-label-sm font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors inline-flex items-center gap-1 mt-3">
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            Try Again
          </button>
        </div>
      )}
      {info && (
        <div className="p-4 rounded-xl bg-surface-container-low text-on-surface shadow-sm mb-4 font-body-sm text-body-sm">
          {info}
        </div>
      )}
      <button onClick={handlePay} disabled={processing}
        className="w-full py-3.5 px-6 rounded-lg bg-secondary text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-md hover:bg-on-secondary-container transition-all disabled:opacity-50">
        <span className="material-symbols-outlined text-[20px]">lock</span>
        <span>{processing ? 'Waiting for payment...' : `Pay ${(order.amount / 100).toFixed(2)} ${order.currency}`}</span>
      </button>
      <p className="text-[11px] text-on-surface-variant text-center mt-3">Card/UPI details go directly to Razorpay — never to our servers.</p>
    </div>
  )
}

export default function PaymentPage() {
  const { applicationId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState('')
  const [, setPaidRef] = useState('')

  useEffect(() => {
    createRazorpayOrder({ application_id: applicationId })
      .then(res => {
        setOrder(res.data)
        setLoading(false)
      })
      .catch(err => {
        setInitError(err.message || 'Failed to create payment')
        setLoading(false)
      })
  }, [applicationId])

  if (loading) return <div className="text-center py-12 font-body-md text-body-md text-on-surface-variant">Loading payment...</div>
  if (!order) return (
    <div className="max-w-md mx-auto text-center py-12">
      <p className="text-red-600 font-semibold mb-2">Failed to initialize payment</p>
      <p className="text-gray-600 text-sm mb-4">{initError}</p>
      <Link to="/" className="text-blue-600 font-medium hover:underline">Back to Home</Link>
    </div>
  )

  const amount = order?.amount || 0
  const currency = order?.currency || 'USD'

  return (
    <div className="w-full">
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Secure Checkout</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-surface-container-lowest">Razorpay Secured</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">UPI, cards and NetBanking via Razorpay. We never see or store your payment details.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center bg-surface-container-low px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">gavel</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Application #{order?.reference_number || applicationId}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: DOSSIER */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">badge</span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Dossier Summary</h2>
              </div>
              <span className="px-2.5 py-1 rounded bg-surface-container-high font-mono text-label-sm text-label-sm text-primary font-bold">
                #{order?.reference_number || applicationId}
              </span>
            </div>
            <div className="bg-surface-container-low rounded-lg p-4 my-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Visa Category</span>
                  <span className="font-headline-sm text-[16px] text-primary font-bold">{order?.visa_name || 'Visa'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Applicant Name</span>
                  <span className="font-label-lg text-label-lg text-primary font-bold">{order?.full_name || '—'}</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Port of Clearance</span>
                  <span className="font-label-lg text-label-lg text-primary font-medium">{order?.destination_name ? `${order.destination_name}` : 'UAE'}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Guaranteed SLA Window
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary">Business Hours</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-high flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block font-semibold">Total Amount Due</span>
                  <span className="text-[11px] text-on-surface-variant">Fixed service fee</span>
                </div>
                <div className="text-right">
                  <span className="font-headline-lg text-headline-lg font-bold text-secondary">${(amount / 100).toFixed(2)} <span className="text-sm font-normal text-primary">{currency}</span></span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3.5 rounded-lg bg-surface-container-low flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">assured_workload</span>
              <div>
                <span className="font-label-sm text-label-sm font-bold text-primary block">Buyer Protection</span>
                <p className="font-body-sm text-[12px] leading-tight text-on-surface-variant mt-0.5">
                  Payments are processed securely via Razorpay. Refunds are handled as per our refund policy.
                </p>
              </div>
            </div>
            <div className="mt-5 p-4 rounded-xl bg-primary-container text-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-container text-[28px]">flight_takeoff</span>
                <div>
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider block">Target Arrival</span>
                  <span className="font-headline-sm text-[15px] font-bold text-surface-container-lowest">{order?.destination_name || 'UAE'} International Airport</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-10 h-10 text-secondary" viewBox="0 0 36 36">
                  <path className="text-on-primary-container/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                  <path className="text-secondary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                </svg>
                <div className="text-right">
                  <span className="block text-[11px] font-bold font-mono text-secondary-container">STEP 3/4</span>
                  <span className="block text-[10px] text-on-primary-container">Finalizing</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center justify-between font-body-sm text-body-sm">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">support_agent</span>
              <span>Support Desk: <strong>+971 4 000 0000</strong></span>
            </div>
            <span className="font-label-sm text-label-sm font-semibold text-on-tertiary-container bg-surface-container px-2 py-1 rounded">24/7 Priority</span>
          </div>
        </div>

        {/* RIGHT: RAZORPAY */}
        <div className="lg:col-span-7">
          <CheckoutPanel order={order} onPaid={setPaidRef} />
        </div>
      </div>
    </div>
  )
}
