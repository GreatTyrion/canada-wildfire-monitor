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

  // OSM standard tiles: keyless. CARTO's basemaps began requiring an API key
  // (watermarked tiles otherwise) in late 2026. Muted via .basemap-tiles in CSS
  // so the overlay palettes still read as they did over a light grey basemap.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    zIndex: 1,
    className: 'basemap-tiles',
  }).addTo(map)

  return map
}
