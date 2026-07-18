import L from 'leaflet'

export function createMap(container: HTMLElement): L.Map {
  const map = L.map(container, {
    center: [59, -98],
    zoom: 4,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false,
    attributionControl: true,
  })
  map.attributionControl.setPrefix(false)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18,
    zIndex: 1,
  }).addTo(map)

  return map
}
