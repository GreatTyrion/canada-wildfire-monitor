import L from 'leaflet'
import { FIRE_STATUS } from '../config'
import { formatStepLabel } from '../data/geomet'
import type { SmokeLayer } from '../map/wmsLayers'

interface ToggleSpec {
  key: string
  label: string
  layer: L.Layer
  on: boolean
}

export function createLayerPanel(root: HTMLElement, map: L.Map, toggles: ToggleSpec[]): void {
  const legendRows = (Object.keys(FIRE_STATUS) as (keyof typeof FIRE_STATUS)[])
    .filter((k) => k !== 'UNKNOWN')
    .map(
      (k) => `
        <li class="legend__row">
          <span class="legend__swatch" style="background:${FIRE_STATUS[k].color}"></span>
          ${FIRE_STATUS[k].label}
        </li>`,
    )
    .join('')

  root.innerHTML = `
    <button class="layers__head" type="button" aria-expanded="true">
      Layers &amp; legend
      <span class="layers__chevron" aria-hidden="true"></span>
    </button>
    <div class="layers__body">
      <ul class="layers__list">
        ${toggles
          .map(
            (t) => `
          <li>
            <label class="layers__toggle">
              <input type="checkbox" data-layer="${t.key}" ${t.on ? 'checked' : ''}>
              <span>${t.label}</span>
            </label>
          </li>`,
          )
          .join('')}
      </ul>
      <ul class="legend">${legendRows}</ul>
      <p class="legend__note">Fire dot size ∝ reported area. AQHI chips use the official ECCC scale.</p>
    </div>`

  const head = root.querySelector<HTMLButtonElement>('.layers__head')!
  head.addEventListener('click', () => {
    const open = head.getAttribute('aria-expanded') === 'true'
    head.setAttribute('aria-expanded', String(!open))
    root.classList.toggle('layers--closed', open)
  })
  // Collapsed by default on small screens.
  if (window.matchMedia('(max-width: 720px)').matches) head.click()

  for (const t of toggles) {
    if (t.on) t.layer.addTo(map)
    root
      .querySelector<HTMLInputElement>(`input[data-layer="${t.key}"]`)!
      .addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
        if (checked) t.layer.addTo(map)
        else map.removeLayer(t.layer)
        if (t.key === 'smoke') {
          document.getElementById('scrubber')!.hidden = !checked
        }
      })
  }
}

export function createSmokeScrubber(
  root: HTMLElement,
  smoke: SmokeLayer,
  steps: string[],
): void {
  root.innerHTML = `
    <label class="scrubber__label" for="scrubber-range">Smoke forecast</label>
    <input id="scrubber-range" class="scrubber__range" type="range"
      min="0" max="${steps.length - 1}" step="1" value="0"
      aria-label="Smoke forecast time">
    <output class="scrubber__time" for="scrubber-range">${formatStepLabel(steps[0], 0)}</output>`

  const range = root.querySelector<HTMLInputElement>('#scrubber-range')!
  const out = root.querySelector<HTMLOutputElement>('.scrubber__time')!
  let pending: number | null = null

  range.addEventListener('input', () => {
    const i = Number(range.value)
    out.textContent = formatStepLabel(steps[i], i)
    // Debounce tile reloads while dragging.
    if (pending) window.clearTimeout(pending)
    pending = window.setTimeout(() => smoke.setTime(steps[i]), 150)
  })
}
