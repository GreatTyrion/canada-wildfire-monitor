import L from 'leaflet'
import { aqhiBand, aqhiColor } from '../config'
import type { AqhiStation } from '../data/geomet'

function stationIcon(station: AqhiStation): L.DivIcon {
  const scale = aqhiColor(station.aqhi)
  const value = station.aqhi > 10 ? '10+' : String(Math.round(station.aqhi))
  return L.divIcon({
    className: 'aqhi-icon',
    html: `<span class="aqhi-icon__chip" style="background:${scale.color};color:${
      scale.dark ? '#fff' : '#1A1A1A'
    }">${value}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function popupHtml(s: AqhiStation): string {
  const band = aqhiBand(s.aqhi)
  const time = new Date(s.observedAt).toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `
    <div class="aqhi-popup">
      <p class="aqhi-popup__name">${s.name}</p>
      <p class="aqhi-popup__value">AQHI ${s.aqhi > 10 ? '10+' : Math.round(s.aqhi)} — ${band.name}</p>
      <p class="aqhi-popup__advice">${band.advice}</p>
      <p class="aqhi-popup__time">Observed ${time}</p>
    </div>`
}

export function createAqhiLayer(): L.LayerGroup {
  return L.layerGroup()
}

export function setAqhiData(group: L.LayerGroup, stations: AqhiStation[]): void {
  group.clearLayers()
  for (const s of stations) {
    L.marker([s.lat, s.lon], { icon: stationIcon(s), keyboard: false })
      .bindPopup(popupHtml(s), { maxWidth: 240 })
      .addTo(group)
  }
}
