# Canadian Wildfire Monitor — Project Brief for Claude

Build a **lightweight web GIS app** that shows wildfire information for Canada. Prioritize people affected by fire or smoke: clear map awareness plus practical, life-saving guidance.

Read `docs/reference-01.md` first for curated data sources, related GitHub apps, and stack ideas. Search GitHub and the web for more comparable apps and official Canadian layers before locking the design.

---

## Goals

1. Show active Canadian wildfire information on an interactive map (locations, perimeters, and smoke when available).
2. Help someone under wildfire or smoke influence: air-quality / smoke context, what to do, when to shelter or leave, and links to official alerts.
3. Stay easy and cheap to deploy — prefer **GitHub Pages** (static frontend). If a container or backend is needed, choose the lowest-cost option and justify it.

---

## UX / design

- Use the **frontend-design** skill for a UI that fits the wildfire subject (serious, calm, high-contrast, mobile-friendly).
- First viewport should make the map and current hazard state obvious; keep clutter low.
- Include a clear path to safety / preparedness content (smoke, air quality, evacuation basics) without burying the map.

---

## Technical constraints

- Prefer a **static or mostly-static** frontend that can talk to public GIS APIs / WMS / GeoJSON endpoints.
- Prefer free public data (CWFIS, provincial layers, NASA FIRMS/EONET, BlueSky Canada smoke, etc.). See `docs/reference-01.md`.
- When registering is required for a data source or API key, **stop and ask me** to register. Tell me exactly:
  - which service
  - why it is needed
  - where to put credentials (e.g. `.env` / GitHub Pages env — never commit secrets)
- Always use **Context7** for current package docs. Use web search when needed.
- Use available skills freely. If a useful skill is missing, **ask permission before installing** it.

---

## Workflow (required)

1. **Research** data sources and similar open-source apps; note which need registration.
2. **Write a detailed plan** (stack, data layers, deployment, MVP vs later). Ask me to register any required sources and where credentials go.
3. After the plan is agreed (or when running in auto mode: write the plan into `docs/`, then proceed), **implement the app**.
4. Default deployment target: GitHub Pages. Document how to deploy.

---

## Out of scope (unless we agree later)

- Heavy backend, paid map tile bills, or storing large historical fire archives.
- Native mobile apps.

---

## Success criteria for MVP

- Map loads with Canadian active fire and/or perimeter data from official or well-documented public sources.
- Basic smoke or air-quality context if a free layer exists without blocking registration.
- Short, practical guidance for people in smoke / nearby fire.
- Deployable to GitHub Pages (or a clearly justified free/cheap alternative) with a short deploy note.
