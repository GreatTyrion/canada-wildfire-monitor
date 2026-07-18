import L from 'leaflet'
import type { AirAlert } from '../data/geomet'

function popupHtml(a: Pick<AirAlert, 'name' | 'text' | 'endsAt'>): string {
  const ends = a.endsAt
    ? new Date(a.endsAt).toLocaleString('en-CA', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null
  const summary = a.text.split('\n').find((line) => line.trim().length > 0) ?? ''
  return `
    <div class="alert-popup">
      <p class="alert-popup__name">${a.name}</p>
      <p class="alert-popup__text">${summary}</p>
      ${ends ? `<p class="alert-popup__time">In effect until ${ends}</p>` : ''}
    </div>`
}

export function createAlertsLayer(): L.GeoJSON {
  return L.geoJSON(undefined, {
    style: {
      color: '#8A4FA3',
      weight: 1.5,
      opacity: 0.8,
      fillColor: '#8A4FA3',
      fillOpacity: 0.08,
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(popupHtml(feature.properties), { maxWidth: 280 })
    },
  })
}

export function setAlertsData(layer: L.GeoJSON, alerts: AirAlert[]): void {
  layer.clearLayers()
  for (const a of alerts) {
    layer.addData({
      type: 'Feature',
      geometry: a.geometry,
      properties: { name: a.name, text: a.text, endsAt: a.endsAt },
    } as never)
  }
}
