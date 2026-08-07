declare global {
  namespace Cypress {
    interface Chainable {
      waitForHydration(options?: { timeout?: number }): Chainable<void>
    }
  }
}

Cypress.Commands.add('waitForHydration', (options?: { timeout?: number }) => {
  const timeout = options?.timeout ?? 15_000

  cy.window().then((win) => {
    const hydrated = (): boolean =>
      Boolean(
        (win.document.querySelector('#__nuxt') as
          | (HTMLElement & { __vue_app__?: unknown })
          | null)?.__vue_app__
      )

    if (hydrated()) return

    return new Promise<void>((resolve) => {
      const start = Date.now()
      const interval = setInterval(() => {
        if (hydrated() || Date.now() - start > timeout) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  })
})

export {}
