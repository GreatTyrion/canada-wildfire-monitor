// Detects that a newer build was deployed and offers a refresh. Never reloads
// on its own — someone may be mid-pan watching a fire near them.

let prompted = false

export async function maybePromptForUpdate(): Promise<void> {
  if (prompted || !import.meta.env.PROD) return
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
    if (!res.ok) return
    const { id } = await res.json()
    if (typeof id === 'string' && id !== __BUILD_ID__) {
      prompted = true
      showPrompt()
    }
  } catch {
    // Offline or version.json unavailable — check again next cycle.
  }
}

function showPrompt(): void {
  const note = document.createElement('div')
  note.className = 'update-note'
  note.setAttribute('role', 'status')
  note.innerHTML = `
    <span>A new version of this app is available.</span>
    <button class="update-note__btn" type="button">Refresh</button>
    <button class="update-note__dismiss" type="button" aria-label="Dismiss">×</button>`
  note.querySelector<HTMLButtonElement>('.update-note__btn')!.addEventListener('click', () => {
    location.reload()
  })
  note.querySelector<HTMLButtonElement>('.update-note__dismiss')!.addEventListener('click', () => {
    note.remove()
  })
  document.body.append(note)
}
