import L from 'leaflet'
import { FIRE_STATUS } from '../config'
import {
  RESPONSE_TYPES,
  fireStatus,
  formatFireSize,
  type FireCollection,
  type FireFeature,
} from '../data/cwfif'

const renderer = L.canvas({ padding: 0.4 })

/** Radius in px from fire size in hectares (sqrt scale, clamped). */
function radiusFor(ha: number): number {
  if (!ha || ha < 0) return 4
  return Math.max(4, Math.min(15, 2.5 + Math.sqrt(ha) / 18))
}

function popupHtml(f: FireFeature): string {
  const p = f.properties
  const status = FIRE_STATUS[fireStatus(p)]
  const reported = p.situation_report_date
    ? new Date(p.situation_report_date).toLocaleString('en-CA', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'unknown'
  const response = RESPONSE_TYPES[p.response_type ?? ''] ?? null
  return `
    <div class="fire-popup">
      <p class="fire-popup__id">${p.agency_code} · ${p.national_fire_id}</p>
      <p class="fire-popup__status" style="color:${status.color}">
        <span class="dot" style="background:${status.color}"></span>${status.label}
      </p>
      <dl class="fire-popup__facts">
        <dt>Size</dt><dd>${formatFireSize(p.fire_size)}</dd>
        ${response ? `<dt>Response</dt><dd>${response}</dd>` : ''}
        <dt>Reported</dt><dd>${reported}</dd>
      </dl>
    </div>`
}

export function createFiresLayer(): L.GeoJSON {
  return L.geoJSON(undefined, {
    pointToLayer: (feature, latlng) => {
      const p = (feature as FireFeature).properties
      const status = FIRE_STATUS[fireStatus(p)]
      return L.circleMarker(latlng, {
        renderer,
        radius: radiusFor(p.fire_size),
        fillColor: status.color,
        fillOpacity: 0.75,
        color: '#FFFFFF',
        weight: 1,
        opacity: 0.9,
      })
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(popupHtml(feature as FireFeature), { maxWidth: 260 })
    },
  })
}

export function setFiresData(layer: L.GeoJSON, fires: FireCollection): void {
  layer.clearLayers()
  layer.addData(fires as never)
}
