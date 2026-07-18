import { AQHI_OBS_URL, ALERTS_URL, SMOKE_FORECAST_HOURS } from '../config'

export interface AqhiStation {
  locationId: string
  name: string
  lat: number
  lon: number
  aqhi: number
  observedAt: string
}

/** Latest AQHI observation per station. */
export async function fetchAqhiObservations(): Promise<AqhiStation[]> {
  const res = await fetch(AQHI_OBS_URL)
  if (!res.ok) throw new Error(`AQHI request failed: ${res.status}`)
  const data = await res.json()
  const byStation = new Map<string, AqhiStation>()
  for (const f of data.features ?? []) {
    const p = f.properties
    if (p.aqhi == null || !f.geometry) continue
    // Results are sorted newest-first, so the first record per station wins.
    if (!byStation.has(p.location_id)) {
      byStation.set(p.location_id, {
        locationId: p.location_id,
        name: p.location_name_en,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        aqhi: p.aqhi,
        observedAt: p.observation_datetime,
      })
    }
  }
  return [...byStation.values()]
}

export interface AirAlert {
  id: string
  name: string
  type: string
  text: string
  endsAt: string | null
  geometry: { type: string; coordinates: unknown }
}

/** Active air-quality / smoke alerts (warnings and statements). */
export async function fetchAirAlerts(): Promise<AirAlert[]> {
  const res = await fetch(ALERTS_URL)
  if (!res.ok) throw new Error(`Alerts request failed: ${res.status}`)
  const data = await res.json()
  const now = Date.now()
  const alerts: AirAlert[] = []
  for (const f of data.features ?? []) {
    const p = f.properties
    const name: string = p.alert_name_en ?? ''
    const relevant = /air quality|smoke/i.test(name)
    const expiry = p.event_end_datetime ?? p.expiration_datetime
    const active = !expiry || Date.parse(expiry) > now
    if (relevant && active && f.geometry) {
      alerts.push({
        id: p.id,
        name,
        type: p.alert_type,
        text: p.alert_text_en ?? '',
        endsAt: p.event_end_datetime ?? null,
        geometry: f.geometry,
      })
    }
  }
  return alerts
}

/** Hourly UTC time steps for the smoke forecast, starting at the current hour. */
export function smokeTimeSteps(): string[] {
  const start = new Date()
  start.setUTCMinutes(0, 0, 0)
  const steps: string[] = []
  for (let h = 0; h <= SMOKE_FORECAST_HOURS; h++) {
    const t = new Date(start.getTime() + h * 3600_000)
    steps.push(t.toISOString().replace(/\.\d{3}Z$/, 'Z'))
  }
  return steps
}

export function formatStepLabel(iso: string, offsetHours: number): string {
  const local = new Date(iso).toLocaleString('en-CA', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
  return offsetHours === 0 ? `Now · ${local}` : `+${offsetHours} h · ${local}`
}
