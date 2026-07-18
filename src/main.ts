import 'leaflet/dist/leaflet.css'
import './styles/main.css'

import { REFRESH_MINUTES } from './config'
import { fetchActiveFires, summarizeFires, type FireCollection } from './data/cwfif'
import {
  fetchAirAlerts,
  fetchAqhiObservations,
  smokeTimeSteps,
  type AirAlert,
  type AqhiStation,
} from './data/geomet'
import { createMap } from './map/basemap'
import { createFiresLayer, setFiresData } from './map/fires'
import { createAqhiLayer, setAqhiData } from './map/aqhi'
import { createAlertsLayer, setAlertsData } from './map/alerts'
import {
  createHotspotsLayer,
  createPerimetersLayer,
  createSmokeLayer,
} from './map/wmsLayers'
import { createStatusBar } from './ui/statusBar'
import { createLayerPanel, createSmokeScrubber } from './ui/layerControl'
import { createDrawer } from './ui/drawer'
import { maybePromptForUpdate } from './ui/updateCheck'
import { wireLocateButton } from './ui/locate'
import { SAFETY_HTML, SAFETY_TITLE } from './ui/safety'

const map = createMap(document.getElementById('map')!)
const statusBar = createStatusBar(document.getElementById('status-bar')!)
const drawer = createDrawer(document.getElementById('drawer')!)

// --- layers ---------------------------------------------------------------
const steps = smokeTimeSteps()
const smoke = createSmokeLayer(steps[0])
const firesLayer = createFiresLayer()
const perimeters = createPerimetersLayer()
const hotspots = createHotspotsLayer()
const aqhiLayer = createAqhiLayer()
const alertsLayer = createAlertsLayer()

createLayerPanel(document.getElementById('layer-panel')!, map, [
  { key: 'fires', label: 'Active fires (reported)', layer: firesLayer, on: true },
  { key: 'perimeters', label: 'Fire perimeter estimates', layer: perimeters, on: true },
  { key: 'hotspots', label: 'Satellite hotspots (24 h)', layer: hotspots, on: false },
  { key: 'smoke', label: 'Smoke forecast (PM2.5)', layer: smoke.layer, on: true },
  { key: 'aqhi', label: 'Air quality (AQHI)', layer: aqhiLayer, on: true },
  { key: 'alerts', label: 'Smoke & air alerts', layer: alertsLayer, on: false },
])
createSmokeScrubber(document.getElementById('scrubber')!, smoke, steps)

// --- data store -----------------------------------------------------------
let fires: FireCollection | null = null
let aqhi: AqhiStation[] = []
let alerts: AirAlert[] = []

const note = document.getElementById('data-note') as HTMLParagraphElement
function showNote(msg: string) {
  note.textContent = msg
  note.hidden = false
  window.setTimeout(() => (note.hidden = true), 8000)
}

async function refresh(): Promise<void> {
  const results = await Promise.allSettled([
    fetchActiveFires(),
    fetchAqhiObservations(),
    fetchAirAlerts(),
  ])
  const [firesRes, aqhiRes, alertsRes] = results

  if (firesRes.status === 'fulfilled') {
    fires = firesRes.value
    setFiresData(firesLayer, fires)
    statusBar.setFires(summarizeFires(fires))
  } else {
    console.error(firesRes.reason)
    showNote('Fire data is temporarily unavailable.')
  }

  if (aqhiRes.status === 'fulfilled') {
    aqhi = aqhiRes.value
    setAqhiData(aqhiLayer, aqhi)
  } else {
    console.error(aqhiRes.reason)
    showNote('Air-quality data is temporarily unavailable.')
  }

  if (alertsRes.status === 'fulfilled') {
    alerts = alertsRes.value
    setAlertsData(alertsLayer, alerts)
    statusBar.setAlertCount(alerts.length)
  } else {
    console.error(alertsRes.reason)
  }

  if (results.some((r) => r.status === 'fulfilled')) {
    statusBar.setUpdated(new Date())
  } else {
    statusBar.setError('Data sources')
  }

  maybePromptForUpdate()
}

refresh()
window.setInterval(refresh, REFRESH_MINUTES * 60_000)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') maybePromptForUpdate()
})

// --- actions --------------------------------------------------------------
wireLocateButton(document.getElementById('btn-locate') as HTMLButtonElement, {
  map,
  drawer,
  getFires: () => fires,
  getAqhi: () => aqhi,
  getAlerts: () => alerts,
})

document.getElementById('btn-safety')!.addEventListener('click', () => {
  drawer.open(SAFETY_TITLE, SAFETY_HTML)
})
