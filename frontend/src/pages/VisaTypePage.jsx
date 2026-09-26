import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchVisaTypeBySlug } from '../api/visaTypes'
import { fetchPricing } from '../api/pricing'
import { fetchCountries } from '../api/countries'
import { fetchFaqs } from '../api/site'

export default function VisaTypePage() {
  const { slug } = useParams()
  const [visa, setVisa] = useState(null)
  const [countries, setCountries] = useState([])
  const [citizenId, setCitizenId] = useState('')
  const [citizenName, setCitizenName] = useState('')
  const [price, setPrice] = useState(null)
  const [priceMissing, setPriceMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)
  const [faqs, setFaqs] = useState([])

  useEffect(() => {
    fetchVisaTypeBySlug(slug).then(res => {
      setVisa(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
    fetchCountries().then(r => setCountries(r.data.results || r.data)).catch(() => {})
    fetchFaqs({ category: 'visa' }).then(r => setFaqs(r.data.results || r.data || [])).catch(() => {})
  }, [slug])

  const handleCitizenChange = (id) => {
    setCitizenId(id)
    setPrice(null)
    setPriceMissing(false)
    if (!id || !visa) return
    const selected = countries.find(c => String(c.id) === String(id))
    setCitizenName(selected ? selected.name : '')
    fetchPricing({ citizen: id, visa_type: visa.id })
      .then(res => {
        const list = res.data.results || res.data || []
        if (list.length > 0) setPrice(list[0])
        else setPriceMissing(true)
      })
      .catch(() => setPriceMissing(true))
  }

  if (loading) return <div className="text-center py-12 font-body-md text-body-md text-on-surface-variant">Loading...</div>
  if (!visa) return <div className="text-center py-12 font-body-md text-body-md">Visa type not found</div>

  const specs = [
    { label: 'Stay Duration', icon: 'calendar_today', value: `${visa.duration_days} Consecutive Days`, sub: 'From day of entry at border checkpoint' },
    { label: 'Entry Allowance', icon: 'flight_land', value: `${visa.entry_type === 'single' ? 'Single' : 'Multiple'} Entry`, sub: 'Airports DXB, AUH, SHJ, DWC, RKT' },
    { label: 'Processing SLA', icon: 'timer', value: visa.processing_time, sub: 'Standard processing queue' },
    { label: 'Visa Validity', icon: 'date_range', value: visa.visa_validity, sub: 'Calculated from approval date' },
  ]

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant mb-space-md">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Home</span>
        </Link>
        <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
        <span className="hover:text-primary transition-colors">Visa Types</span>
        <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
        <span className="text-on-surface font-semibold">{visa.name}</span>
      </nav>

      {/* HERO */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wider">{visa.category}</span>
            <span className="px-2.5 py-1 rounded-full bg-primary-container text-surface-container-lowest font-label-sm text-label-sm font-semibold uppercase tracking-wider">{visa.entry_type} Entry</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">{visa.name}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs leading-relaxed">
            {visa.description || `Tourist entry authorization for travel across all 7 Emirates — application prepared and submitted by our team.`}
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0 bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">{visa.processing_time} SLA</span>
          </div>
          <span className="text-outline-variant font-label-sm text-label-sm">|</span>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">fingerprint</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Quick Processing</span>
          </div>
          <span className="text-outline-variant font-label-sm text-label-sm">|</span>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">autorenew</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">{visa.duration_days}d Stay</span>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN LAYOUT */}
      <section className="w-full py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* GATEWAY CARD */}
            <div className="relative w-full rounded-xl overflow-hidden bg-primary-container text-on-primary p-space-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-primary to-secondary/30 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex flex-col gap-space-xs max-w-lg">
                  <div className="inline-flex items-center gap-space-xs text-secondary-container font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Assisted Application Standard
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold leading-tight">
                    Valid Across All 7 Emirates
                  </h2>
                  <p className="font-body-md text-body-md text-on-primary-container">
                    Covers entry via Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.
                  </p>
                </div>
              </div>
            </div>

            {/* SPEC MATRIX */}
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Visa Specification Matrix</h3>
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">Key Terms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {specs.map(s => (
                  <div key={s.label} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-space-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">{s.label}</span>
                      <span className="material-symbols-outlined text-secondary text-[24px]">{s.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-primary font-bold">{s.value}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PERMITTED / PROHIBITED */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">Permitted Activities &amp; Limitations</span>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">What This Visa Covers</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-xs text-on-tertiary-container font-headline-sm text-headline-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Authorized Activities</span>
                  </div>
                  <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface">
                    {['Tourism, sightseeing, and desert safari excursions', 'Visiting family, relatives, and accredited friends', 'Attending expos, exhibitions and conferences', 'Exploratory non-remunerated business inquiries'].map(a => (
                      <li key={a} className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">done</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-xs text-error font-headline-sm text-headline-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    <span>Prohibited Under Law</span>
                  </div>
                  <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface">
                    {['Paid employment on a tourist permit', 'Overstaying beyond the authorized period', 'Activities outside the stated visa purpose'].map(a => (
                      <li key={a} className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">close</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ — managed in Admin > FAQs (category: visa). Hidden until added. */}
            {faqs.length > 0 && (
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">FAQs</span>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">Common Questions</h3>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {faqs.map((f, i) => (
                    <div key={f.id || i} className="bg-surface-container-low rounded-lg p-space-md">
                      <button className="w-full flex items-center justify-between text-left focus:outline-none" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span className="font-label-lg text-label-lg text-primary font-bold">{f.question}</span>
                        <span className={`material-symbols-outlined text-primary text-[20px] transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>
                      {openFaq === i && <div className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">{f.answer}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PRICING PANEL */}
          <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">Fee Schedule</span>
                <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">Verified</span>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant font-medium block mb-1" htmlFor="vt-citizen">Pricing calculated for:</label>
                <select id="vt-citizen" value={citizenId} onChange={e => handleCitizenChange(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg focus:outline-none cursor-pointer">
                  <option value="">Select citizenship</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {citizenName && <span className="font-label-sm text-label-sm text-secondary font-semibold">{citizenName}</span>}
              </div>
              <div className="flex flex-col gap-1">
                {price ? (
                  <>
                    <div className="flex items-baseline gap-space-xs">
                      <span className="font-display-hero text-display-hero text-secondary font-bold">${parseFloat(price.price).toFixed(2)}</span>
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">{price.currency}</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Fixed fee · {visa.processing_time} processing</span>
                  </>
                ) : priceMissing ? (
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">Pricing not available for this combination yet.</span>
                ) : (
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">Select your citizenship to see the official fee.</span>
                )}
              </div>
              <div className="bg-surface-container p-space-sm rounded-lg flex flex-col gap-space-xs">
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface">
                  <span>Stay Duration</span>
                  <span className="font-medium">{visa.duration_days} Days</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface">
                  <span>Entry Type</span>
                  <span className="font-medium capitalize">{visa.entry_type}</span>
                </div>
                <div className="h-0.5 bg-outline-variant/30 my-1"></div>
                <div className="flex justify-between font-label-md text-label-md text-primary font-bold">
                  <span>Total Payable</span>
                  <span>{price ? `$${parseFloat(price.price).toFixed(2)} ${price.currency}` : '—'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs">
                <Link to={`/apply/${visa.slug}`} className="w-full py-space-sm px-space-md rounded-lg bg-secondary text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-xs shadow-md hover:bg-on-secondary-container transition-all">
                  <span>Apply for {visa.duration_days}-Day Visa Now</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
