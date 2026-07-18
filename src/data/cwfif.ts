import { ACTIVE_FIRES_URL, FIRE_STATUS, type FireStatusCode } from '../config'

export interface FireProperties {
  agency_code: string
  national_fire_id: string
  agency_fire_id: string
  fire_size: number
  stage_of_control_status: string | null
  response_type: string | null
  situation_report_date: string | null
  status_date: string | null
  latitude: number
  longitude: number
}

export interface FireFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: FireProperties
}

export interface FireCollection {
  type: 'FeatureCollection'
  features: FireFeature[]
}

export async function fetchActiveFires(): Promise<FireCollection> {
  const res = await fetch(ACTIVE_FIRES_URL)
  if (!res.ok) throw new Error(`Active fires request failed: ${res.status}`)
  return res.json()
}

export function fireStatus(props: FireProperties): FireStatusCode {
  const code = (props.stage_of_control_status ?? '').toUpperCase()
  return code in FIRE_STATUS ? (code as FireStatusCode) : 'UNKNOWN'
}

export interface FireSummary {
  total: number
  outOfControl: number
}

export function summarizeFires(fires: FireCollection): FireSummary {
  let outOfControl = 0
  for (const f of fires.features) {
    if (fireStatus(f.properties) === 'OC') outOfControl++
  }
  return { total: fires.features.length, outOfControl }
}

export function formatFireSize(ha: number): string {
  if (ha == null || ha < 0) return 'size unreported'
  if (ha >= 10000) return `${(ha / 1000).toFixed(1)}k ha`
  return `${Math.round(ha).toLocaleString('en-CA')} ha`
}

export const RESPONSE_TYPES: Record<string, string> = {
  FUL: 'Full response',
  MOD: 'Modified response',
  MON: 'Being monitored',
}
