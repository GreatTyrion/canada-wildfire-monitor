import type { FireSummary } from '../data/cwfif'

export interface StatusBar {
  setFires(summary: FireSummary): void
  setAlertCount(n: number): void
  setUpdated(date: Date): void
  setError(source: string): void
}

export function createStatusBar(root: HTMLElement): StatusBar {
  root.innerHTML = `
    <div class="status">
      <div class="status__item">
        <span class="status__num" data-stat="total">–</span>
        <span class="status__label">active fires</span>
      </div>
      <div class="status__item status__item--oc">
        <span class="status__num" data-stat="oc">–</span>
        <span class="status__label">out of control</span>
      </div>
      <div class="status__item status__item--alerts">
        <span class="status__num" data-stat="alerts">–</span>
        <span class="status__label">smoke alerts</span>
      </div>
      <span class="status__updated" data-stat="updated"></span>
    </div>`

  const el = (name: string) => root.querySelector<HTMLElement>(`[data-stat="${name}"]`)!

  return {
    setFires(summary) {
      el('total').textContent = summary.total.toLocaleString('en-CA')
      el('oc').textContent = summary.outOfControl.toLocaleString('en-CA')
    },
    setAlertCount(n) {
      el('alerts').textContent = String(n)
    },
    setUpdated(date) {
      el('updated').textContent = `Updated ${date.toLocaleTimeString('en-CA', {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    },
    setError(source) {
      el('updated').textContent = `${source} unavailable — retrying soon`
    },
  }
}
