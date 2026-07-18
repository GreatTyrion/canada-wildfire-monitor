import { defineConfig } from 'vite'

// A unique id per deploy: the commit SHA on CI, a timestamp locally. It is
// baked into the bundle AND emitted as version.json so a running tab can
// detect that a newer build was deployed.
const buildId = process.env.GITHUB_SHA?.slice(0, 12) ?? `local-${Date.now()}`

// GitHub Pages serves the site at https://<user>.github.io/<repo>/ — the base
// must match the repo name. Override with VITE_BASE for a custom domain.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/canada-wildfire-monitor/',
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    {
      name: 'emit-version-json',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ id: buildId }),
        })
      },
    },
  ],
})
