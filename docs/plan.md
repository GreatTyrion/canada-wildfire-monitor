# Canadian Wildfire Monitor — Implementation Plan

## Context

Per `docs/idea.md`: build a lightweight, static web GIS app showing Canadian wildfire activity, prioritizing people affected by fire or smoke — map awareness plus practical safety guidance. Deploy to GitHub Pages. User confirmed: **Leaflet + vanilla TypeScript**, **English-only MVP** (strings structured for later FR), **"Check my location" in MVP**.

**Registration required: none.** Every data source below was verified live (2026-07-18): HTTP 200, GeoJSON/PNG output, `Access-Control-Allow-Origin: *`. NASA FIRMS (needs a key) is unnecessary — CWFIS hotspots already include VIIRS/MODIS/HMS detections.

## Verified data sources (all free, keyless, CORS-open)

| Layer | Source / endpoint | Format |
|---|---|---|
| Active fires (agency-reported, 955 today) | CWFIF GeoServer WFS `https://geoserver.cwfif.nrcan.gc.ca/geoserver/wfs` — `typeNames=public:cwfif_national_activefires`, `outputFormat=application/json`, `srsName=EPSG:4326`, `CQL_FILTER=now()>=record_start AND now()<=record_end` | GeoJSON points; attrs: `stage_of_control_status` (OC/BH/UC), `fire_size` (ha), `agency_code`, `national_fire_id`, `response_type`, dates |
| Satellite hotspots (last 24 h) | CWFIS legacy GeoServer WMS `https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms` — layer `public:hotspots_last24hrs` | WMS PNG overlay (thousands of points — raster is cheaper than vector here) |
| Fire perimeter estimates (M3) | Same WMS — layer `public:m3_polygons_current` | WMS PNG overlay |
| Smoke forecast (wildfire PM2.5 plume) | ECCC GeoMet WMS `https://geo.weather.gc.ca/geomet` — layer `RAQDPS.Sfc_PM2.5-WildfireSmokePlume`, `TIME=` hourly steps, today → +72 h (verified Dimension block), `transparent=true`, EPSG:3857 OK | WMS PNG + time dimension; legend via GetLegendGraphic |
| AQHI observations | `https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?f=json&sortby=-observation_datetime&limit=…` (dedupe latest per `location_id`) | GeoJSON points, `aqhi` value |
| Weather alerts (incl. air quality / evac-related) | `https://api.weather.gc.ca/collections/weather-alerts/items?f=json` | GeoJSON polygons |
| Basemap | CARTO Positron raster tiles (`basemaps.cartocdn.com`, keyless, attribution) with OSM fallback | Raster tiles |

Note: CWFIS is mid-migration from the legacy GeoServer to CWFIF — keep all base URLs in one config module (`src/config.ts`) so a URL swap is a one-line change.

## Stack

Vite + TypeScript (vanilla, no framework) + Leaflet 1.9.x. No backend, no keys, no secrets. Only runtime deps: `leaflet`. Use Context7 for current Leaflet/Vite docs during implementation; use the **frontend-design** skill for the UI pass (serious, calm, high-contrast, mobile-first) and **dataviz** conventions where charts/scales appear (AQHI uses its official color scale).

## App structure

```
wildfire-monitor/
├─ index.html
├─ vite.config.ts          # base: '/<repo-name>/' for GH Pages
├─ src/
│  ├─ main.ts              # boot: map init, layer wiring, refresh timer (10 min)
│  ├─ config.ts            # all endpoint URLs + layer names in one place
│  ├─ map/
│  │  ├─ basemap.ts        # CARTO tiles + attribution
│  │  ├─ fires.ts          # WFS GeoJSON → canvas circle markers, size ∝ fire_size, color by stage_of_control_status; popups
│  │  ├─ wmsLayers.ts      # hotspots, perimeters, smoke (TIME-enabled) as L.tileLayer.wms
│  │  └─ aqhi.ts           # AQHI station markers, official AQHI colors
│  ├─ data/
│  │  ├─ cwfif.ts          # fetch + parse active fires; national summary stats
│  │  ├─ geomet.ts         # AQHI + alerts fetch; smoke time-step helpers (build hourly TIME list)
│  │  └─ geo.ts            # haversine distance, point-in-polygon (small local utils, no turf)
│  ├─ ui/
│  │  ├─ statusBar.ts      # header: N active fires / N out of control / data timestamps
│  │  ├─ layerControl.ts   # toggles + smoke time slider + legend
│  │  ├─ locate.ts         # "Check my location": geolocation → nearest fires (distance/status), nearest AQHI value, containing alert polygons, tailored guidance; all client-side
│  │  └─ safety.ts         # slide-in safety panel (see content below)
│  └─ styles/              # CSS (custom properties, dark-friendly, mobile bottom-sheet)
├─ docs/plan.md            # copy of this approved plan (brief requires plan in docs/)
└─ .github/workflows/deploy.yml
```

## Key behaviors

- **First viewport**: full-screen map centered on Canada with fires + smoke on by default; slim status bar showing current national picture; two clear buttons: "Check my location" and "Safety info". No clutter.
- **Fires layer**: canvas renderer; legend Out of control / Being held / Under control; popup with name, agency, size (ha), status, last report date.
- **Smoke slider**: hourly steps from now to +48 h (72 available); slider updates WMS `TIME`; label shows local time; opacity ~0.6.
- **Check my location**: browser geolocation (never leaves the client) → panel listing 3 nearest fires with distance + bearing + status, AQHI at nearest station with health message, any active alert polygons containing the point, and context-appropriate guidance + links to official provincial emergency pages.
- **Safety panel**: short practical content — AQHI bands & what to do, smoke protection (indoors, filtration, N95), evacuation alert-vs-order basics, go-bag list, links to official sources (GetPrepared.ca, provincial wildfire services, firesmoke.ca).
- **Refresh**: fires/AQHI/alerts refetched every 10 min; data timestamps shown.
- **Failure handling**: each layer loads independently; a failed source shows a small "layer unavailable" note without breaking the map.

## Deployment (GitHub Pages)

- `.github/workflows/deploy.yml`: on push to `main` → `npm ci && npm run build` → deploy `dist/` via `actions/deploy-pages`. `vite.config.ts` sets `base` to the repo path.
- Write `README.md` deploy note (enable Pages → GitHub Actions source; everything else automatic). Repo needs `git init` + GitHub remote — will ask before creating anything on GitHub.

## Out of MVP (documented as "later")

French toggle, provincial evacuation-order layers (BC/AB ArcGIS), FIRMS key-based layer, PWA/offline, historical stats.

## Verification

1. `npm run dev` — confirm in browser: all layers render, fire popups work, smoke slider changes the plume, toggles work.
2. Devtools sensor override to Kelowna, BC (49.888, -119.496) → "Check my location" shows plausible nearest fires/AQHI/guidance.
3. Simulate a failed source (block a URL) → graceful degradation.
4. `npm run build && npm run preview` — production build works under the GH Pages base path.
5. Mobile viewport check (375 px): status bar, bottom sheet, tap targets.
