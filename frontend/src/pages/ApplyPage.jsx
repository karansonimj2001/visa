import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchVisaTypeBySlug } from '../api/visaTypes'
import { fetchCountries } from '../api/countries'
import { fetchDestinations } from '../api/destinations'
import { fetchPricing } from '../api/pricing'
import { submitApplication } from '../api/applications'
import useSiteSettings, { getSupportPhone } from '../hooks/useSiteSettings'

const inputClass = "w-full h-12 pl-10 pr-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all"
const selectClass = "w-full h-12 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all cursor-pointer"
const labelClass = "font-label-md text-label-md text-on-surface font-semibold"
const sectionHead = (icon, num, title) => (
  <div className="flex items-center justify-between pb-space-sm">
    <div className="flex items-center gap-space-sm">
      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <h2 className="font-headline-md text-headline-md text-primary font-bold">{num}. {title}</h2>
    </div>
    <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-label-sm uppercase">Section {num} of 4</span>
  </div>
)

export default function ApplyPage() {
  const { visaTypeSlug } = useParams()
  const navigate = useNavigate()
  const [visaType, setVisaType] = useState(null)
  const [citizens, setCitizens] = useState([])
  const [destinations, setDestinations] = useState([])
  const [price, setPrice] = useState(null)
  const [nationalIdRequired, setNationalIdRequired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [attested, setAttested] = useState(false)
  const settings = useSiteSettings()
  const supportPhone = getSupportPhone(settings)
  const passportInput = useRef(null)
  const photoInput = useRef(null)
  const nationalIdInput = useRef(null)

  const [formData, setFormData] = useState({
    citizen_country: '',
    travelling_from_country: '',
    destination: '',
    full_name: '',
    email: '',
    phone: '',
    passport_number: '',
    date_of_birth: '',
    national_id_number: '',
    passport_file: null,
    photo_file: null,
    national_id_file: null,
  })

  useEffect(() => {
    fetchVisaTypeBySlug(visaTypeSlug).then(r => setVisaType(r.data)).catch(() => {})
    fetchCountries().then(r => setCitizens(r.data.results || r.data)).catch(() => {})
    fetchDestinations().then(r => setDestinations(r.data.results || r.data)).catch(() => {})
  }, [visaTypeSlug])

  const refreshPrice = (citizenId) => {
    setPrice(null)
    if (!citizenId || !visaType) return
    fetchPricing({ citizen: citizenId, visa_type: visaType.id })
      .then(res => {
        const list = res.data.results || res.data || []
        if (list.length > 0) setPrice(list[0])
      })
      .catch(() => {})
  }

  const handleCountryChange = (e) => {
    const countryId = e.target.value
    setFormData(f => ({ ...f, citizen_country: countryId }))
    const selected = citizens.find(c => String(c.id) === String(countryId))
    if (selected) {
      setNationalIdRequired(!!selected.is_national_id_required)
      if (!selected.is_national_id_required) {
        setFormData(f => ({ ...f, national_id_number: '', national_id_file: null }))
      }
    } else {
      setNationalIdRequired(false)
    }
    refreshPrice(countryId)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) setFormData(f => ({ ...f, [name]: files[0] }))
  }

  const fileLabel = (file) => file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : 'No file selected'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!attested) {
      setSubmitError('Please accept the application declaration to proceed.')
      return
    }
    if (!formData.passport_file) {
      setSubmitError('Please upload your passport bio-data page scan (Section 4).')
      return
    }
    if (!formData.photo_file) {
      setSubmitError('Please upload your passport portrait photo (Section 4).')
      return
    }
    if (nationalIdRequired && !formData.national_id_file) {
      setSubmitError('National ID scan is required for your selected citizenship (Section 3).')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([key, val]) => {
        if (val instanceof File) fd.append(key, val)
        else if (val === null || val === undefined) return
        else if ((key === 'travelling_from_country' || key === 'destination') && val === '') return
        else fd.append(key, val)
      })
      if (visaType?.id) fd.append('visa_type', String(visaType.id))
      const res = await submitApplication(fd)
      navigate(`/payment/${res.data.application_id}`)
    } catch (err) {
      const details = err.details
        ? ' ' + Object.entries(err.details).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join(' | ')
        : ''
      setSubmitError((err.message || 'Application failed.') + details)
    }
    setLoading(false)
  }

  const priceText = price ? `$${parseFloat(price.price).toFixed(2)} ${price.currency}` : '—'

  return (
    <div className="w-full">
      {/* PROTOCOL STREAMER + BREADCRUMB */}
      <section className="w-full bg-surface-container-low border-b border-surface-dim/40 py-space-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap">
            <Link className="hover:text-primary transition-colors" to="/">Home</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <Link className="hover:text-primary transition-colors" to="/">Visa Types</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">{visaType?.name || 'Visa'}</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-secondary font-bold">Application Form</span>
          </nav>
          <div className="flex items-center gap-space-sm self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-ping"></span>
              Secure Application
            </span>
            <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-secondary">encrypted</span>
              TLS 1.3 · 256-Bit
            </span>
          </div>
        </div>
      </section>

      {/* HEADLINE + STEPPER */}
      <section className="w-full bg-surface pt-space-lg pb-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  {visaType ? `${visaType.category} (${visaType.entry_type} Entry)` : 'Tourist Visa'}
                </span>
                <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">verified_user</span>
                  Assisted Application Deck
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
                {visaType?.name || 'Visa Application'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                Complete the form below and our team will verify, prepare and submit your application. Valid for entry via Dubai International (DXB) and Al Maktoum International (DWC).
              </p>
            </div>
            <div className="flex items-center gap-space-sm self-start lg:self-center bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-secondary-fixed shadow">
                <span className="material-symbols-outlined text-[24px]">policy</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Processed By</span>
                <span className="font-label-lg text-label-lg text-primary font-bold">Our Visa Experts Team</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md relative">
              {[
                { n: '01', t: 'Travel & Identity', s: 'Step 01 • Active', active: true, icon: 'badge' },
                { n: '02', t: 'Biometrics & Pre-Check', s: 'Step 02', active: false },
                { n: '03', t: 'Secure Payment', s: 'Step 03', active: false },
                { n: '04', t: 'Visa Issuance', s: 'Step 04', active: false },
              ].map(st => (
                <div key={st.n} className={`flex items-center gap-space-sm relative ${st.active ? '' : 'opacity-60'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 shadow-md ${st.active ? 'bg-primary-container text-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {st.active ? <span className="material-symbols-outlined text-[18px]">{st.icon}</span> : st.n}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-label-sm text-label-sm uppercase tracking-wider ${st.active ? 'text-secondary font-bold' : 'text-outline font-semibold'}`}>{st.s}</span>
                    <span className={`font-label-lg text-label-lg ${st.active ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}>{st.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORM + DOSSIER */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-space-xl items-start">
          <form className="w-full lg:w-[68%] flex flex-col gap-space-xl" id="visaApplicationForm" onSubmit={handleSubmit}>

            {/* SECTION 1 */}
            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-primary font-bold">1. Travel &amp; Port Details</h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-label-sm uppercase">Section 1 of 4</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className={`${labelClass} flex items-center justify-between`} htmlFor="citizenCountry">
                    <span>Citizen Nationality (As stated on Passport) *</span>
                    {nationalIdRequired
                      ? <span className="text-secondary font-label-sm text-label-sm font-semibold">National ID required</span>
                      : <span className="text-on-tertiary-container font-label-sm text-label-sm flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span> e-Visa Eligible
                        </span>}
                  </label>
                  <div className="relative">
                    <select className={selectClass} id="citizenCountry" name="citizen_country" required value={formData.citizen_country} onChange={handleCountryChange}>
                      <option value="">Select your country</option>
                      {citizens.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-secondary pointer-events-none">public</span>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-outline pointer-events-none">unfold_more</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="embarkationPoint">Travelling From Country</label>
                  <div className="relative">
                    <select className={selectClass} id="embarkationPoint" name="travelling_from_country" value={formData.travelling_from_country} onChange={handleChange}>
                      <option value="">Select (optional)</option>
                      {citizens.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">flight_class</span>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-outline pointer-events-none">unfold_more</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="destSelect">Designated UAE Arrival Authority *</label>
                  <div className="relative">
                    <select className={selectClass} id="destSelect" name="destination" required value={formData.destination} onChange={handleChange}>
                      <option value="">Select destination</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.name} — {d.country}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px] pointer-events-none">location_city</span>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-outline pointer-events-none">unfold_more</span>
                  </div>
                </div>
              </div>
              {nationalIdRequired && (
                <div className="p-4 rounded-xl bg-secondary-container/40 flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">gavel</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    <strong>National ID verification is required</strong> for your selected citizenship. Complete Section 3 below.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2 */}
            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-space-md">
              {sectionHead('person_pin', '2', 'Personal & Identity Credentials')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className={labelClass} htmlFor="fullName">Full Legal Name (Exact Match with Passport) *</label>
                  <div className="relative">
                    <input className={inputClass} id="fullName" name="full_name" type="text" required value={formData.full_name} onChange={handleChange} placeholder="As printed on passport" />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-[20px]">verified</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Must mirror surname and given names without salutations (Mr./Dr.).</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="emailDispatch">Email for Delivery &amp; Updates *</label>
                  <div className="relative">
                    <input className={inputClass} id="emailDispatch" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">mark_email_read</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Approved e-Visa PDF will be dispatched here.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="phoneNumber">Mobile Phone (WhatsApp Enabled) *</label>
                  <div className="relative">
                    <input className={inputClass} id="phoneNumber" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+971 50 000 0000" />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">chat</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time status alerts and QR dispatch.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="applicantDob">Date of Birth *</label>
                  <div className="relative">
                    <input className={inputClass} id="applicantDob" name="date_of_birth" type="date" required value={formData.date_of_birth} onChange={handleChange} />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">cake</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className={labelClass} htmlFor="passportField">International Passport Number *</label>
                  <div className="relative">
                    <input className={`${inputClass} font-mono font-bold tracking-wider`} id="passportField" name="passport_number" type="text" required value={formData.passport_number} onChange={handleChange} placeholder="e.g. A12345678" />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">menu_book</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Passport must have minimum <strong>6 months validity</strong> past your entry date.</p>
                </div>
              </div>
            </div>

            {/* SECTION 3 — CONDITIONAL */}
            {nationalIdRequired && (
              <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined text-[20px]">shield_person</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-primary font-bold">3. Conditional National ID Verification</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">MANDATORY PROTOCOL</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary-container/40 flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">gavel</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    <strong>Supplementary National ID verification is required</strong> for your selected citizenship to expedite border clearance.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="nationalIdNumber">National ID Number *</label>
                  <div className="relative">
                    <input className={`${inputClass} font-mono font-bold tracking-widest`} id="nationalIdNumber" name="national_id_number" type="text" required={nationalIdRequired} value={formData.national_id_number} onChange={handleChange} placeholder="As printed on your ID" />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-[20px]">fingerprint</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4 */}
            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-primary font-bold">4. Document Scans &amp; Biometric Drops</h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-label-sm uppercase">Section 4 of 4</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>1. Passport Bio-Data Page Scan *</label>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-14 h-16 rounded bg-surface-container-high flex flex-col items-center justify-center relative overflow-hidden shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-outline text-[28px]">document_scanner</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-primary">{fileLabel(formData.passport_file)}</span>
                      <span className="font-body-sm text-body-sm text-outline">JPG, PNG or PDF · Max 5 MB</span>
                    </div>
                  </div>
                  <input ref={passportInput} type="file" name="passport_file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                  <button type="button" onClick={() => passportInput.current?.click()}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span> Select File
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className={labelClass}>2. Passport Portrait Photo * <span className="text-secondary font-bold">ICAO Standard</span></label>
                <div onClick={() => photoInput.current?.click()}
                  className="p-6 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[32px]">photo_camera_front</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                    {formData.photo_file ? fileLabel(formData.photo_file) : 'Drag & drop your photo or click to browse'}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1 mb-4">
                    Recent photo, white background, neutral expression. JPG or PNG · Max 5 MB.
                  </p>
                  <input ref={photoInput} type="file" name="photo_file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {nationalIdRequired && (
                <div className="flex flex-col gap-2 pt-2">
                  <label className={labelClass}>3. National ID Scan (Front &amp; Back) *</label>
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[24px]">contact_page</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-bold text-primary">{fileLabel(formData.national_id_file)}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Front and reverse in one file.</span>
                      </div>
                    </div>
                    <input ref={nationalIdInput} type="file" name="national_id_file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => nationalIdInput.current?.click()}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span> Select File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ATTESTATION */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
              <input checked={attested} onChange={e => setAttested(e.target.checked)} className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary cursor-pointer" id="declarationAttest" type="checkbox" />
              <label className="font-body-sm text-body-sm text-on-surface leading-relaxed cursor-pointer select-none" htmlFor="declarationAttest">
                I declare that all particulars and documents provided are authentic and complete. Incorrect information may lead to rejection of the application.
              </label>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-lg bg-error-container/70 text-on-error-container flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">notification_important</span>
                <p className="font-body-sm text-body-sm leading-snug"><strong>Submission blocked:</strong> {submitError}</p>
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex flex-col gap-space-md">
              <button disabled={loading} className="w-full py-4 px-8 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50" type="submit">
                <span className="material-symbols-outlined text-[24px]">lock</span>
                <span>{loading ? 'Submitting...' : `Proceed to Secure Payment${priceText !== '—' ? ` — ${priceText}` : ''}`}</span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-2">
                {[
                  { icon: 'enhanced_encryption', t: 'Secure Storage', s: 'Encrypted Uploads' },
                  { icon: 'verified', t: 'Document Pre-Check', s: 'Reviewed Before Filing' },
                  { icon: 'cloud_done', t: 'Expert Submission', s: 'Filed By Our Team' },
                ].map(b => (
                  <div key={b.t} className="p-3 rounded-lg bg-surface-container-lowest flex items-center gap-space-xs shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">{b.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-primary font-bold">{b.t}</span>
                      <span className="font-body-sm text-[11px] leading-tight text-on-surface-variant">{b.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* RIGHT: DOSSIER */}
          <aside className="w-full lg:w-[32%] lg:sticky lg:top-24 flex flex-col gap-space-md">
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-6 flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[26px]">account_balance</span>
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Dossier Summary</h3>
                    <span className="font-label-sm text-label-sm text-outline">Real-Time Tariff Breakdown</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container" title="Connection Active"></span>
              </div>
              <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container-low">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-primary font-bold">{visaType?.name || 'Visa'}</span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">{visaType?.category || ''}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-sm text-on-surface-variant pt-1 border-t border-surface-dim/40">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-outline uppercase font-semibold">Entry Window</span>
                    <span className="font-semibold text-on-surface">{visaType?.visa_validity || '—'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-outline uppercase font-semibold">Stay Duration</span>
                    <span className="font-semibold text-on-surface">{visaType ? `${visaType.duration_days} Days` : '—'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-label-md text-primary font-semibold">Processing Priority</span>
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-primary">Standard Processing</span>
                  <span className="text-[12px] text-on-surface-variant">{visaType?.processing_time || '24 – 48 Hours'} processing</span>
                </div>
                  <span className="font-label-md text-label-md text-on-tertiary-container font-bold">Included</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
                <div className="mt-2 pt-3 border-t border-surface-container flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-primary font-bold">Total Fee</span>
                    <span className="font-label-sm text-label-sm text-outline">Fixed service fee</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold leading-none">{priceText}</span>
                    <span className="font-label-sm text-label-sm text-outline">{price ? `${price.currency} net` : 'net'}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                <span className="material-symbols-outlined text-on-tertiary-container text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-primary">Refund Guarantee</span>
                  <p className="font-body-sm text-[11px] text-on-surface-variant leading-snug">Refund available as per our refund policy.</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary-container text-on-primary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                  <span className="font-semibold text-secondary-fixed text-sm">Secure Online Application</span>
                </div>
                <span className="font-mono text-[10px] text-on-primary-container">42ms LAT</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-primary">
                <span className="material-symbols-outlined text-[22px] text-secondary">support_agent</span>
                <span className="font-label-lg text-label-lg font-bold">Helpdesk</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                {supportPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-sm">Hotline:</span>
                    <a href={supportPhone.href} className="font-bold text-primary hover:underline">{supportPhone.display}</a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-sm">Direct Desk:</span>
                  <span className="font-bold text-on-tertiary-container flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp Live
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
