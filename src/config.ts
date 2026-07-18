// All external endpoints in one place. CWFIS is mid-migration from the legacy
// GeoServer (cwfis.cfs.nrcan.gc.ca) to the newer CWFIF GeoServer — if a layer
// disappears, check https://cwfis.cfs.nrcan.gc.ca/datamart for its new home.

export const CWFIF_WFS = 'https://geoserver.cwfif.nrcan.gc.ca/geoserver/wfs'
export const CWFIS_WMS = 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms'
export const GEOMET_WMS = 'https://geo.weather.gc.ca/geomet'
export const GEOMET_API = 'https://api.weather.gc.ca'

export const ACTIVE_FIRES_URL =
  `${CWFIF_WFS}?service=WFS&version=2.0.0&request=GetFeature` +
  `&typeNames=public:cwfif_national_activefires&outputFormat=application/json` +
  `&srsName=EPSG:4326&CQL_FILTER=` +
  encodeURIComponent('now()>=record_start AND now()<=record_end')

export const AQHI_OBS_URL =
  `${GEOMET_API}/collections/aqhi-observations-realtime/items` +
  `?f=json&sortby=-observation_datetime&limit=1000`

export const ALERTS_URL =
  `${GEOMET_API}/collections/weather-alerts/items?f=json&limit=500`

export const WMS_LAYERS = {
  hotspots: 'public:hotspots_last24hrs',
  perimeters: 'public:m3_polygons_current',
  smoke: 'RAQDPS.Sfc_PM2.5-WildfireSmokePlume',
} as const

export const SMOKE_FORECAST_HOURS = 48

export const REFRESH_MINUTES = 10

// Stage-of-control palette — CVD-validated against the light basemap.
export const FIRE_STATUS = {
  OC: { label: 'Out of control', color: '#C33C3C' },
  BH: { label: 'Being held', color: '#C4841D' },
  UC: { label: 'Under control', color: '#12876B' },
  UNKNOWN: { label: 'Status unreported', color: '#6B7280' },
} as const

export type FireStatusCode = keyof typeof FIRE_STATUS

// Official ECCC Air Quality Health Index scale (fixed by the AQHI program).
export const AQHI_SCALE = [
  { max: 1, color: '#00CCFF', dark: false },
  { max: 2, color: '#0099CC', dark: true },
  { max: 3, color: '#006699', dark: true },
  { max: 4, color: '#FFFF00', dark: false },
  { max: 5, color: '#FFCC00', dark: false },
  { max: 6, color: '#FF9933', dark: false },
  { max: 7, color: '#FF6666', dark: true },
  { max: 8, color: '#FF0000', dark: true },
  { max: 9, color: '#CC0000', dark: true },
  { max: 10, color: '#990000', dark: true },
  { max: Infinity, color: '#660000', dark: true },
]

export function aqhiColor(value: number) {
  const v = Math.round(value)
  return AQHI_SCALE.find((s) => v <= s.max) ?? AQHI_SCALE[AQHI_SCALE.length - 1]
}

export function aqhiBand(value: number): { name: string; advice: string } {
  if (value <= 3) return { name: 'Low risk', advice: 'Enjoy usual outdoor activities.' }
  if (value <= 6)
    return {
      name: 'Moderate risk',
      advice:
        'Consider reducing strenuous outdoor activity if you have breathing discomfort. At-risk people should take it easier.',
    }
  if (value <= 10)
    return {
      name: 'High risk',
      advice:
        'Reduce or reschedule strenuous outdoor activity. Children, seniors, and people with heart or lung conditions should stay indoors.',
    }
  return {
    name: 'Very high risk',
    advice:
      'Avoid strenuous outdoor activity. Everyone — especially at-risk people — should stay indoors with windows closed and air filtered.',
  }
}
