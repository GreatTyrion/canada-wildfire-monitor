import L from 'leaflet'
import { FIRE_STATUS, aqhiBand } from '../config'
import { fireStatus, formatFireSize, type FireCollection } from '../data/cwfif'
import type { AirAlert, AqhiStation } from '../data/geomet'
import { compassDirection, haversineKm, pointInGeometry } from '../data/geo'
import type { Drawer } from './drawer'

export interface LocateDeps {
  map: L.Map
  drawer: Drawer
  getFires(): FireCollection | null
  getAqhi(): AqhiStation[]
  getAlerts(): AirAlert[]
}

interface NearbyFire {
  distanceKm: number
  direction: string
  statusLabel: string
  statusColor: string
  size: string
  id: string
}

function nearestFires(fires: FireCollection, lat: number, lon: number, n = 3): NearbyFire[] {
  return fires.features
    .map((f) => {
      const p = f.properties
      const status = FIRE_STATUS[fireStatus(p)]
      return {
        distanceKm: haversineKm(lat, lon, p.latitude, p.longitude),
        direction: compassDirection(lat, lon, p.latitude, p.longitude),
        statusLabel: status.label,
        statusColor: status.color,
        size: formatFireSize(p.fire_size),
        id: `${p.agency_code.toUpperCase()} fire ${p.agency_fire_id}`,
      }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n)
}

function nearestStation(stations: AqhiStation[], lat: number, lon: number) {
  let best: { station: AqhiStation; km: number } | null = null
  for (const s of stations) {
    const km = haversineKm(lat, lon, s.lat, s.lon)
    if (!best || km < best.km) best = { station: s, km }
  }
  return best
}

function guidance(fires: NearbyFire[], aqhi: number | null, alertCount: number): string {
  const closeOC = fires.find((f) => f.statusLabel === 'Out of control' && f.distanceKm < 50)
  const lines: string[] = []
  if (closeOC) {
    lines.push(
      `An out-of-control fire is about <strong>${Math.round(closeOC.distanceKm)} km</strong> from you. ` +
        `Check your provincial emergency service now for evacuation alerts, keep your phone charged, and be ready to leave if told to.`,
    )
  }
  if (aqhi != null && aqhi >= 7) {
    lines.push(
      `Air quality is in the <strong>${aqhiBand(aqhi).name.toLowerCase()}</strong> range. ` +
        `Stay indoors with windows closed, run a HEPA or furnace filter if you have one, and wear a well-fitted N95 if you must go out.`,
    )
  } else if (alertCount > 0) {
    lines.push(
      `A smoke or air-quality alert covers your area. Limit time outdoors and watch for changing conditions.`,
    )
  }
  if (lines.length === 0) {
    lines.push(
      `No out-of-control fire within 50 km and no air-quality alert at your location right now. ` +
        `Conditions can change quickly in fire season — check back, and see the safety guide to prepare.`,
    )
  }
  return lines.map((l) => `<p class="sitrep__advice">${l}</p>`).join('')
}

function reportHtml(
  lat: number,
  lon: number,
  fires: NearbyFire[],
  aqhiInfo: { station: AqhiStation; km: number } | null,
  alerts: AirAlert[],
): string {
  const stamp = new Date().toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const fireRows = fires
    .map(
      (f) => `
      <li class="sitrep__fire">
        <span class="sitrep__distance">${Math.round(f.distanceKm)} km ${f.direction}</span>
        <span class="sitrep__firemeta">
          <span class="dot" style="background:${f.statusColor}"></span>
          ${f.statusLabel} · ${f.size} · ${f.id}
        </span>
      </li>`,
    )
    .join('')

  const aqhiBlock = aqhiInfo
    ? `
      <p class="sitrep__row"><span class="sitrep__key">AQHI</span>
        <span class="sitrep__val">${aqhiInfo.station.aqhi > 10 ? '10+' : Math.round(aqhiInfo.station.aqhi)}
        — ${aqhiBand(aqhiInfo.station.aqhi).name}
        <span class="sitrep__muted">(${aqhiInfo.station.name}, ${Math.round(aqhiInfo.km)} km away)</span></span></p>`
    : `<p class="sitrep__row"><span class="sitrep__key">AQHI</span><span class="sitrep__val">no station data</span></p>`

  const alertBlock =
    alerts.length > 0
      ? alerts
          .map(
            (a) =>
              `<p class="sitrep__row"><span class="sitrep__key">Alert</span><span class="sitrep__val">${a.name}</span></p>`,
          )
          .join('')
      : `<p class="sitrep__row"><span class="sitrep__key">Alerts</span><span class="sitrep__val">none at this location</span></p>`

  return `
    <div class="sitrep">
      <p class="sitrep__stamp">Position ${lat.toFixed(3)}, ${lon.toFixed(3)} · ${stamp} · stays on your device</p>
      ${guidance(fires, aqhiInfo?.station.aqhi ?? null, alerts.length)}
      <h3 class="sitrep__h">Nearest fires</h3>
      <ul class="sitrep__fires">${fireRows || '<li>No active fires reported.</li>'}</ul>
      <h3 class="sitrep__h">Air quality</h3>
      ${aqhiBlock}
      <h3 class="sitrep__h">Alerts here</h3>
      ${alertBlock}
      <p class="sitrep__foot">Distances are straight-line from reported fire positions — roads and terrain differ. Always follow official evacuation orders.</p>
    </div>`
}

export function wireLocateButton(button: HTMLButtonElement, deps: LocateDeps): void {
  let marker: L.Marker | null = null

  button.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      deps.drawer.open('Your location', '<p>This browser does not support location.</p>')
      return
    }
    button.disabled = true
    button.dataset.busy = '1'
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        button.disabled = false
        delete button.dataset.busy
        const { latitude: lat, longitude: lon } = pos.coords
        const fires = deps.getFires()
        if (!fires) {
          deps.drawer.open('Your location', '<p>Fire data has not loaded yet — try again in a moment.</p>')
          return
        }
        const near = nearestFires(fires, lat, lon)
        const station = nearestStation(deps.getAqhi(), lat, lon)
        const containing = deps.getAlerts().filter((a) => pointInGeometry(lon, lat, a.geometry))

        if (marker) marker.remove()
        marker = L.marker([lat, lon], {
          icon: L.divIcon({ className: 'you-icon', html: '<span></span>', iconSize: [16, 16] }),
        }).addTo(deps.map)
        deps.map.setView([lat, lon], Math.max(deps.map.getZoom(), 7))

        deps.drawer.open('Your location report', reportHtml(lat, lon, near, station, containing))
      },
      (err) => {
        button.disabled = false
        delete button.dataset.busy
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access for this site, or pan the map to your area instead.'
            : 'Could not determine your location. Pan the map to your area instead.'
        deps.drawer.open('Your location', `<p>${msg}</p>`)
      },
      { timeout: 12_000, maximumAge: 300_000 },
    )
  })
}
