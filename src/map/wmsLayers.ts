import L from 'leaflet'
import { CWFIS_WMS, GEOMET_WMS, WMS_LAYERS } from '../config'

export function createHotspotsLayer(): L.TileLayer.WMS {
  return L.tileLayer.wms(CWFIS_WMS, {
    layers: WMS_LAYERS.hotspots,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: 0.85,
    zIndex: 4,
    attribution: 'Hotspots: <a href="https://cwfis.cfs.nrcan.gc.ca">CWFIS, Natural Resources Canada</a>',
  })
}

export function createPerimetersLayer(): L.TileLayer.WMS {
  return L.tileLayer.wms(CWFIS_WMS, {
    layers: WMS_LAYERS.perimeters,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: 0.7,
    zIndex: 3,
    attribution: 'Perimeters: <a href="https://cwfis.cfs.nrcan.gc.ca">CWFIS M3</a>',
  })
}

export interface SmokeLayer {
  layer: L.TileLayer.WMS
  setTime(iso: string): void
}

export function createSmokeLayer(initialTime: string): SmokeLayer {
  const layer = L.tileLayer.wms(GEOMET_WMS, {
    layers: WMS_LAYERS.smoke,
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    opacity: 0.55,
    zIndex: 2,
    attribution:
      'Smoke: <a href="https://eccc-msc.github.io/open-data/">ECCC FireWork</a>',
    // Non-standard WMS parameter understood by GeoMet's time-enabled layers.
    ...( { TIME: initialTime } as Record<string, string> ),
  })
  return {
    layer,
    setTime(iso: string) {
      layer.setParams({ TIME: iso } as never)
    },
  }
}
