import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCountryBySlug } from '../api/countries'
import { fetchVisaTypes } from '../api/visaTypes'
import { fetchPricing } from '../api/pricing'
import { fetchRequirements } from '../api/site'

const USD_TO_AED = 3.67

export default function CountryPage() {
  const { slug } = useParams()
  const [country, setCountry] = useState(null)
  const [visas, setVisas] = useState([])
  const [prices, setPrices] = useState({})
  const [requirements, setRequirements] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCountryBySlug(slug).then(countryRes => {
      const countryData = countryRes.data
      setCountry(countryData)
      Promise.all([
        fetchVisaTypes({ citizen_country: countryData.id }),
        fetchPricing({ citizen: countryData.id }),
        fetchRequirements({ country: countryData.id }),
      ]).then(([visaRes, pricingRes, reqRes]) => {
        setVisas(visaRes.data.results || visaRes.data)
        const list = pricingRes.data.results || pricingRes.data || []
        const map = {}
        list.forEach(p => { if (!(p.visa_type in map)) map[p.visa_type] = p })
        setPrices(map)
        const reqList = reqRes.data.results || reqRes.data || []
        setRequirements(reqList)
        setLoading(false)
      }).catch(() => setLoading(false))
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="text-center py-12 font-body-md text-body-md text-on-surface-variant">Loading...</div>
  if (!country) return <div className="text-center py-12 font-body-md text-body-md">Country not found</div>

  const fmtPrice = (p) => {
    if (!p) return null
    const val = parseFloat(p.price)
    if (currency === 'AED') return { amount: (val * USD_TO_AED).toFixed(2), cur: 'AED' }
    return { amount: val.toFixed(2), cur: p.currency || 'USD' }
  }

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant mb-space-md">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Home</span>
        </Link>
        <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
        <Link to="/" className="hover:text-primary transition-colors">Countries</Link>
        <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
        <span className="text-on-surface font-semibold">{country.name}</span>
      </nav>

      {/* HERO + METRIC */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-md">
        <div className="lg:col-span-8">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Visa Guidance for Citizens Of</span>
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold mt-2">
            {country.name} — UAE Visa Options
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            {country.content || `Visa types, document requirements and processing guidance for ${country.name} passport holders travelling to the United Arab Emirates. We handle the application for you.`}
          </p>
        </div>
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Application Support</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
              ACCEPTING APPLICATIONS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-primary">24–48h</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">typical processing window</span>
          </div>
          <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mt-2">
            <span>Online application</span>
            <span className="font-semibold text-primary">Trackable anytime</span>
          </div>
        </div>
      </section>

      {/* QUICK STATS BAR */}
      <div className="mt-8 bg-surface-container rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary">timer</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Processing SLA</span>
              <span className="font-label-md text-label-md font-bold text-on-surface">24–48 Hours</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">flight_land</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Entry Points</span>
              <span className="font-label-md text-label-md font-bold text-on-surface">DXB, AUH, SHJ</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">National ID Protocol</span>
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {country.is_national_id_required ? 'Mandatory Verification' : 'Standard Verification'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">lock</span>
          <span>Secure SSL-Encrypted Application</span>
        </div>
      </div>

      {/* CONDITIONAL WARNING BANNER */}
      {country.is_national_id_required && (
        <section className="mb-10">
          <div className="rounded-xl p-5 bg-secondary-fixed/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-sm text-on-secondary">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">Important Notice</span>
                    <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed text-[10px] font-bold uppercase">Document Required</span>
                  </div>
                <p className="font-body-md text-body-md text-on-secondary-fixed font-semibold mt-0.5">
                  Additional National ID verification is required for citizens of {country.name} applying for tourist and transit entry.
                </p>
              </div>
            </div>
            <a className="shrink-0 px-4 py-2 rounded-lg bg-surface-container-lowest text-secondary font-label-md text-label-md font-bold shadow-sm hover:bg-surface transition-all flex items-center gap-1.5" href="#requirements-section">
              <span>Review Document Specs</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </section>
      )}

      {/* VISA CATEGORIES */}
      <section className="mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              Available Visa Categories
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">Select Your e-Visa Type</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Transparent fixed fees. Our team prepares and submits your application to the UAE immigration authorities.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg self-start md:self-auto">
            <button
              className={`px-3 py-1 rounded font-label-sm text-label-sm font-bold shadow-sm ${currency === 'USD' ? 'bg-surface-container-lowest text-primary' : 'text-on-surface-variant hover:text-primary transition-colors'}`}
              type="button" onClick={() => setCurrency('USD')}>
              USD (Standard)
            </button>
            <button
              className={`px-3 py-1 rounded font-label-sm text-label-sm font-medium transition-colors ${currency === 'AED' ? 'bg-surface-container-lowest text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              type="button" onClick={() => setCurrency('AED')}>
              AED (Dirhams)
            </button>
          </div>
        </div>

        {visas.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">No visa types available for your country combination.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visas.map((v, idx) => {
              const price = fmtPrice(prices[v.id])
              const featured = idx === 1 && visas.length > 1
              return (
                <div key={v.id} className={`flex flex-col bg-surface-container-lowest rounded-xl p-6 shadow-md transition-all hover:shadow-xl justify-between group ${featured ? 'shadow-xl relative' : ''}`}>
                  {featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Most Popular
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                      <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1">
                        {v.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-primary-container text-surface-container-lowest font-label-sm text-label-sm font-medium">
                        {v.entry_type} Entry
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary font-bold mb-2">{v.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 leading-relaxed">
                      {v.duration_days}-day stay · Processing in {v.processing_time} · Valid {v.visa_validity}.
                    </p>
                    <div className="bg-surface-container-low rounded-lg p-4 mb-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">date_range</span>
                          Duration:
                        </span>
                        <span className="font-semibold text-primary">{v.duration_days} Days</span>
                      </div>
                      <div className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">timelapse</span>
                          Processing SLA:
                        </span>
                        <span className="font-semibold text-primary">{v.processing_time}</span>
                      </div>
                      <div className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                          Stay Validity:
                        </span>
                        <span className="font-semibold text-primary">{v.visa_validity}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-5 pt-3">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Fixed Service Fee</span>
                      {price ? (
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="font-headline-lg text-headline-lg font-bold text-primary">${price.amount}</span>
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">{price.cur}</span>
                        </div>
                      ) : (
                        <span className="font-label-md text-label-md text-on-surface-variant font-medium">Contact us for pricing</span>
                      )}
                    </div>
                    <Link to={`/apply/${v.slug}`} className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md hover:bg-on-secondary-container transition-all">
                      <span>Apply Now</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* REQUIREMENTS */}
      <section id="requirements-section" className="mb-14">
        <div className="flex flex-col gap-1 mb-8">
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-widest">Stage 01 — Document Compliance</span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Mandatory Documents for {country.name} Citizens</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Document and entry guidance for {country.name} passport holders travelling to the UAE.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Mandatory Documents</h3>
            </div>
            <div className="space-y-4">
              {requirements.length === 0 && !country.is_national_id_required && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Document checklist is being prepared for this country.</p>
              )}
              {requirements.map(d => (
                <div key={d.id} className="flex items-start gap-3.5 p-4 rounded-lg bg-surface-container-low shadow-sm">
                  <div className="p-2 rounded bg-surface-container-lowest text-secondary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">{d.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-primary">{d.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{d.description}</p>
                  </div>
                </div>
              ))}
              {country.is_national_id_required && (
                <div className="flex items-start gap-3.5 p-4 rounded-lg bg-secondary-fixed/30 shadow-sm">
                  <div className="p-2 rounded bg-secondary-container text-on-secondary-fixed shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-label-lg text-label-lg font-bold text-primary">National ID Card</h4>
                      <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold uppercase">Mandatory</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                      Color copy of both front and back sides of National ID for address verification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">2</div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Travel Rules to Know</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: 'gavel', title: 'Overstay Fines Apply', desc: 'Overstaying your permitted duration attracts daily fines under UAE immigration law. Depart before expiry.' },
                { icon: 'event_available', title: 'Entry Validity Window', desc: 'Enter within the visa validity period stated on your e-Visa. The stay count starts on entry.' },
                { icon: 'flight_land', title: 'All Ports Accepted', desc: 'Valid for entry at Dubai (DXB), Abu Dhabi (AUH), Sharjah (SHJ) and all UAE land/sea ports.' },
              ].map(r => (
                <div key={r.title} className="flex items-start gap-3.5 p-4 rounded-lg bg-surface-container-low shadow-sm">
                  <div className="p-2 rounded bg-surface-container-lowest text-secondary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-primary">{r.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
