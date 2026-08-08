/// <reference types="cypress" />

describe('Footer navigation', () => {
  beforeEach(() => {
    cy.visit('/onboarding')
    cy.waitForHydration()
    cy.get('[data-testid="onboarding-continue"]').click()
    cy.get('[data-testid="onboarding-continue"]').click()
    cy.url().should('include', '/pokedex')
  })

  it('renders the footer with the four main sections', () => {
    cy.get('[data-testid="footer-nav"]').should('be.visible')
    cy.get('[data-testid="footer-nav"] .app-footer-nav__item').should('have.length', 4)

    cy.get('[data-testid="footer-nav"]').contains('Pokédex')
    cy.get('[data-testid="footer-nav"]').contains('Regiones')
    cy.get('[data-testid="footer-nav"]').contains('Favoritos')
    cy.get('[data-testid="footer-nav"]').contains('Perfil')
  })

  it('marks the current section as active', () => {
    cy.get('a[href="/pokedex"]').should('have.class', 'is-active')
  })

  it('navigates between sections using the footer', () => {
    cy.get('a[href="/regions"]').click()
    cy.url().should('include', '/regions')
    cy.get('a[href="/regions"]').should('have.class', 'is-active')

    cy.get('a[href="/favorites"]').click()
    cy.url().should('include', '/favorites')
    cy.get('a[href="/favorites"]').should('have.class', 'is-active')

    cy.get('a[href="/profile"]').click()
    cy.url().should('include', '/profile')
    cy.get('a[href="/profile"]').should('have.class', 'is-active')

    cy.get('a[href="/pokedex"]').click()
    cy.url().should('include', '/pokedex')
  })
})
