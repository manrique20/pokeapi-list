/// <reference types="cypress" />

import PokeballLoader from '../../app/components/ui/PokeballLoader.vue'

describe('PokeballLoader', () => {
  it('renders the pokeball with its center button', () => {
    cy.mount(PokeballLoader)

    cy.get('.pokeball-loader').should('exist')
    cy.get('.pokeball-loader__button').should('exist')
  })

  it('exposes an accessible status role', () => {
    cy.mount(PokeballLoader)

    cy.get('.pokeball-loader').should('have.attr', 'role', 'status')
    cy.get('.pokeball-loader').should('have.attr', 'aria-label', 'Loading')
  })
})
