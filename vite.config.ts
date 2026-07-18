import { defineConfig } from 'vite'

// GitHub Pages serves the site at https://<user>.github.io/<repo>/ — the base
// must match the repo name. Override with VITE_BASE for a custom domain.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/canada-wildfire-monitor/',
})
