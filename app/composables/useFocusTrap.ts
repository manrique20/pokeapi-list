

import type { Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
].join(',')

export function useFocusTrap(container: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null = null

  function getFocusable(): HTMLElement[] {
    if (!container.value) return []
    return Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.tabIndex !== -1 && el.offsetParent !== null
    )
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const focusable = getFocusable()
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    const active = document.activeElement as HTMLElement | null
    const withinContainer = active ? container.value?.contains(active) : false

    if (event.shiftKey) {
      if (!withinContainer || active === first) {
        event.preventDefault()
        last.focus()
      }
    } else if (!withinContainer || active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function activate() {
    if (!import.meta.client) return
    previouslyFocused = document.activeElement as HTMLElement | null
    const focusable = getFocusable()
    ;(focusable[0] ?? container.value)?.focus()
    document.addEventListener('keydown', onKeydown)
  }

  function deactivate() {
    if (!import.meta.client) return
    document.removeEventListener('keydown', onKeydown)
    previouslyFocused?.focus()
    previouslyFocused = null
  }

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
  })

  return { activate, deactivate }
}
