export interface Drawer {
  open(title: string, bodyHtml: string): HTMLElement
  close(): void
}

export function createDrawer(root: HTMLElement): Drawer {
  root.innerHTML = `
    <div class="drawer__head">
      <h2 class="drawer__title"></h2>
      <button class="drawer__close" type="button" aria-label="Close panel">×</button>
    </div>
    <div class="drawer__body"></div>`

  const title = root.querySelector<HTMLElement>('.drawer__title')!
  const body = root.querySelector<HTMLElement>('.drawer__body')!

  function close() {
    root.classList.remove('drawer--open')
    root.setAttribute('aria-hidden', 'true')
  }

  root.querySelector('.drawer__close')!.addEventListener('click', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })
  close()

  return {
    open(t, html) {
      title.textContent = t
      body.innerHTML = html
      root.classList.add('drawer--open')
      root.setAttribute('aria-hidden', 'false')
      body.scrollTop = 0
      return body
    },
    close,
  }
}
