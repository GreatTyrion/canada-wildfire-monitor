# Canada Wildfire Monitor

A lightweight, fully static web map of Canadian wildfire activity for people affected by fire or smoke: live fire locations and status, satellite hotspots, perimeter estimates, a 48-hour smoke forecast, air quality (AQHI), and practical safety guidance — including a private, on-device "Check my location" report.

**No backend. No API keys. No registration.** All data comes directly from free public services in the browser.

## Data sources

| Layer | Source |
|---|---|
| Active fires (agency-reported) | [CWFIF GeoServer](https://geoserver.cwfif.nrcan.gc.ca/geoserver/wfs) WFS, Natural Resources Canada |
| Satellite hotspots (24 h) & M3 perimeter estimates | [CWFIS GeoServer](https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms) WMS |
| Smoke forecast (wildfire PM2.5) | [ECCC GeoMet](https://eccc-msc.github.io/open-data/) WMS, RAQDPS-FireWork |
| AQHI observations & weather alerts | [MSC GeoMet OGC API](https://api.weather.gc.ca) |
| Basemap | CARTO Positron / © OpenStreetMap contributors |

CWFIS is migrating layers from its legacy GeoServer to CWFIF; all endpoints live in `src/config.ts` if a URL needs updating.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/canada-wildfire-monitor/
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Deploy to GitHub Pages

1. Push this repo to GitHub with the default branch `main`.
2. In the repo settings, **Settings → Pages → Source → GitHub Actions**.
3. Push to `main` — `.github/workflows/deploy.yml` builds and publishes automatically.

The Vite `base` is set to `/canada-wildfire-monitor/` in `vite.config.ts`; if your repo has a different name, change it there (or set `VITE_BASE=/your-repo/`). For a custom domain use `VITE_BASE=/`.

## Notes

- "Check my location" uses the browser's geolocation API entirely client-side; coordinates never leave the device.
- This is an awareness tool, not an alerting service. Evacuation alerts and orders come from provincial/territorial authorities — links are in the in-app safety guide.
