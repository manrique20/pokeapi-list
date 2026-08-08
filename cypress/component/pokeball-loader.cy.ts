/// <reference types="cypress" />

import PokeballLoader from '../../app/components/ui/PokeballLoader.vue'

// The component runner has no Nuxt i18n plugin (see SKILL.md), but
// PokeballLoader now reads its aria-label via `$t`. Stub `$t` as an
// identity function so the mount doesn't throw; assertions below check
// against the raw i18n key rather than a translated string.
const mountOptions = { global: { mocks: { $t: (key: string) => key } } }

describe('PokeballLoader', () => {
  it('renders the pokeball with its center button', () => {
    cy.mount(PokeballLoader, mountOptions)

    cy.get('.pokeball-loader').should('exist')
    cy.get('.pokeball-loader__button').should('exist')
  })

  it('exposes an accessible status role', () => {
    cy.mount(PokeballLoader, mountOptions)

    cy.get('.pokeball-loader').should('have.attr', 'role', 'status')
    cy.get('.pokeball-loader').should('have.attr', 'aria-label', 'common.loading')
  })
})
