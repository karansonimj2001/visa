import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCountries } from '../api/countries'
import { fetchVisaTypes } from '../api/visaTypes'
import { fetchPricing } from '../api/pricing'
import { fetchDestinations } from '../api/destinations'

export default function Home() {
  const [citizen, setCitizen] = useState('')
  const [fromCountry, setFromCountry] = useState('')
  const [destination, setDestination] = useState('')
  const [countries, setCountries] = useState([])
  const [destinations, setDestinations] = useState([])
  const [results, setResults] = useState(null)
  const [prices, setPrices] = useState({})
  const [citizenName, setCitizenName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCountries().then(r => setCountries(r.data.results || r.data)).catch(() => {})
    fetchDestinations().then(r => setDestinations(r.data.results || r.data)).catch(() => {})
  }, [])

  const handleSearch = async () => {
    if (!citizen) {
      setError('Please select your citizenship to see eligible visas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const [visaRes, pricingRes] = await Promise.all([
        fetchVisaTypes({ citizen_country: citizen }),
        fetchPricing({ citizen, travelling_from: fromCountry || undefined, destination: destination || undefined }),
      ])
      const visas = visaRes.data.results || visaRes.data
      const pricingList = pricingRes.data.results || pricingRes.data || []
      const priceMap = {}
      pricingList.forEach(p => { if (!(p.visa_type in priceMap)) priceMap[p.visa_type] = p })
      setResults(visas)
      setPrices(priceMap)
      const selected = countries.find(c => String(c.id) === String(citizen))
      setCitizenName(selected ? selected.name : '')
    } catch (err) {
      setError(err.message || 'Error fetching results')
    }
    setLoading(false)
  }

  const selectClass = "w-full h-12 pl-10 pr-8 bg-surface-container-low text-on-surface font-label-lg text-label-lg rounded-lg focus:outline-none focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer"
  const iconLeft = "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]"
  const iconRight = "material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]"
  const labelClass = "font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider flex items-center gap-1"

  return (
    <div className="w-full">
      {/* HERO + SEARCH WIDGET */}
      <section className="relative w-full overflow-hidden bg-primary-container pb-space-xl pt-space-md">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-secondary-container/15 via-tertiary-fixed/10 to-transparent blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <h1 className="font-display-hero text-display-hero text-surface-container-lowest max-w-4xl tracking-tight leading-tight mb-space-md">
            Apply for Your Dubai Visa
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl leading-relaxed mb-space-xl">
            Online visa application assistance for travellers entering
            the United Arab Emirates — we prepare, verify and submit your application for you.
          </p>

          <div className="w-full max-w-5xl rounded-xl bg-surface-container-lowest shadow-xl p-space-md lg:p-space-lg text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-end">
              <div className="md:col-span-3 flex flex-col gap-space-xs">
                <label className={labelClass} htmlFor="citizen-selector">
                  <span className="material-symbols-outlined text-[16px] text-secondary">public</span>
                  Citizen of
                </label>
                <div className="relative">
                  <select id="citizen-selector" className={selectClass} value={citizen} onChange={e => setCitizen(e.target.value)}>
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className={iconLeft}>flag</span>
                  <span className={iconRight}>expand_more</span>
                </div>
              </div>
              <div className="md:col-span-3 flex flex-col gap-space-xs">
                <label className={labelClass} htmlFor="from-selector">
                  <span className="material-symbols-outlined text-[16px] text-secondary">flight_takeoff</span>
                  Travelling From
                </label>
                <div className="relative">
                  <select id="from-selector" className={selectClass} value={fromCountry} onChange={e => setFromCountry(e.target.value)}>
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className={iconLeft}>flight</span>
                  <span className={iconRight}>expand_more</span>
                </div>
              </div>
              <div className="md:col-span-3 flex flex-col gap-space-xs">
                <label className={labelClass} htmlFor="dest-selector">
                  <span className="material-symbols-outlined text-[16px] text-secondary">location_city</span>
                  Destination
                </label>
                <div className="relative">
                  <select id="dest-selector" className={selectClass} value={destination} onChange={e => setDestination(e.target.value)}>
                    <option value="">Select destination</option>
                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <span className={iconLeft}>pin_drop</span>
                  <span className={iconRight}>expand_more</span>
                </div>
              </div>
              <div className="md:col-span-3">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  id="search-visas-btn"
                  className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-md hover:bg-on-secondary-container hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
                  <span className="material-symbols-outlined text-[20px]">travel_explore</span>
                  <span>{loading ? 'Searching...' : 'Search Visas'}</span>
                </button>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex flex-wrap items-center justify-between gap-y-2 text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">lock</span>
                <span>Secure SSL-Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">bolt</span>
                <span>Instant Eligibility Pre-Check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
                <span>Applications Prepared by Visa Experts</span>
              </div>
            </div>
          </div>
          {error && <p className="mt-4 text-sm font-medium text-secondary-fixed">{error}</p>}
        </div>
      </section>

      {/* RESULTS GRID */}
      {results && (
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wider mb-2">
                <span>Ready to Apply</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                Available Visa Categories{citizenName ? ` for ${citizenName} Citizens` : ''}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Select a visa category and let our team handle document verification and submission for you.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-ping"></span>
                <span>{results.length} Visa Option{results.length === 1 ? '' : 's'} Found</span>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">No visa types available for this country combination yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
              {results.map((v, idx) => {
                const price = prices[v.id]
                const featured = idx === 1 && results.length > 1
                return (
                  <div key={v.id} className={`relative flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all ${featured ? 'shadow-xl scale-[1.02] z-10' : ''}`}>
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold tracking-widest uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-space-md mt-2">
                        <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wider">{v.category}</span>
                        <span className="px-2.5 py-1 rounded-full bg-primary-container text-surface-container-lowest font-label-sm text-label-sm font-semibold uppercase tracking-wider">{v.entry_type} Entry</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-primary font-bold">{v.name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-space-md">
                        Processing in {v.processing_time}. Valid {v.visa_validity}.
                      </p>
                      <div className="p-space-sm rounded-lg bg-surface-container-low mb-space-md">
                        {price ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-headline-lg text-headline-lg text-primary font-bold">${price.price}</span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase">{price.currency}</span>
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Transparent fixed fee</span>
                          </>
                        ) : (
                          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Contact us for pricing</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
                        <div className="flex items-center justify-between py-1 bg-surface-container-low/40 px-2 rounded">
                          <span className="text-on-surface-variant">Stay Duration:</span>
                          <span className="font-semibold text-primary">{v.duration_days} Days</span>
                        </div>
                        <div className="flex items-center justify-between py-1 px-2">
                          <span className="text-on-surface-variant">Processing SLA:</span>
                          <span className="font-semibold text-on-tertiary-container flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">timer</span> {v.processing_time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 bg-surface-container-low/40 px-2 rounded">
                          <span className="text-on-surface-variant">Validity Before Travel:</span>
                          <span className="font-semibold text-primary">{v.visa_validity}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 px-2">
                          <span className="text-on-surface-variant">Assistance Included:</span>
                          <span className="font-semibold text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Full Support
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-space-xs pt-space-sm">
                      <Link to={`/apply/${v.slug}`} className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all">
                        <span>Apply Now</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                      <Link to={`/visa-types/${v.slug}`} className="text-center font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-1">
                        View Category Guidelines →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* WORKFLOW */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="w-14 h-14 rounded-lg bg-primary text-on-primary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px]">description</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold">STAGE 01</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Requirements</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">Document Checklist</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
                Passport, photograph and travel details. National ID verification applies for select citizenships.
              </p>
            </div>
            <Link to="/track" className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-secondary transition-colors">
              <span>Review Full Document Checklist</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="w-14 h-14 rounded-lg bg-secondary text-on-secondary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px]">travel_explore</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold">STAGE 02</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Digital Submission</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">How to Apply in 3 Steps</h3>
              <div className="flex flex-col gap-2 p-space-sm rounded-lg bg-surface-container-low mb-space-md">
                {['Fill personal credentials', 'Upload passport & photo', 'Pay securely via Stripe'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 font-body-sm text-body-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[11px]">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary">
              <span>Start from the search above</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="w-14 h-14 rounded-lg bg-primary-container text-surface-container-lowest flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px] text-on-tertiary-container">manage_search</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold">STAGE 03</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Real-Time Radar</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">Track Application Status</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
                Already submitted? Check your application status with your reference number.
              </p>
              <div className="p-space-sm rounded-lg bg-surface-container-low mb-space-md">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">Sample Reference:</span>
                <div className="font-headline-sm text-headline-sm text-primary font-mono font-bold tracking-wider mt-0.5">DXB-2026-000123</div>
              </div>
            </div>
            <Link to="/track" className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-secondary transition-colors">
              <span>Go to Live Tracker</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="rounded-xl bg-surface-container p-space-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter text-center md:text-left">
            {[
              { icon: 'account_balance', color: 'text-primary', title: 'Expert Review', sub: 'Every Application Checked' },
              { icon: 'verified_user', color: 'text-secondary', title: 'Secure', sub: 'SSL-Encrypted Process' },
              { icon: 'support_agent', color: 'text-primary', title: '24/7 Support', sub: 'Real Human Assistance' },
              { icon: 'lock', color: 'text-on-tertiary-container', title: '256-bit SSL', sub: 'Encrypted Checkout' },
            ].map(t => (
              <div key={t.title} className="flex flex-col md:flex-row items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[24px] ${t.color}`}>{t.icon}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">{t.title}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
