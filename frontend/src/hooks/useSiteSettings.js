import { useState, useEffect } from 'react'
import { fetchSettings } from '../api/site'

let cached = null
let pending = null

function loadSettings() {
  if (cached) return Promise.resolve(cached)
  if (!pending) {
    pending = fetchSettings()
      .then(r => { cached = r.data || {}; return cached })
      .catch(() => ({}))
      .finally(() => { pending = null })
  }
  return pending
}

export function getSupportPhone(settings) {
  const display = (settings?.support_phone || '').trim()
  if (!display) return null
  const href = 'tel:+' + display.replace(/\D/g, '')
  return { display, href }
}

export default function useSiteSettings() {
  const [settings, setSettings] = useState(cached || {})
  useEffect(() => {
    let live = true
    loadSettings().then(s => { if (live) setSettings(s) })
    return () => { live = false }
  }, [])
  return settings
}
