/// <reference types="cypress" />

describe('Onboarding flow', () => {
  it('shows the splash screen on first visit and redirects to onboarding', () => {
    cy.visit('/')
    cy.waitForHydration()

    cy.get('[data-testid="splash"]').should('be.visible')
    cy.get('[data-testid="splash-loader"]').should('exist')

    cy.url({ timeout: 10_000 }).should('include', '/onboarding')
  })

  it('lets the user complete onboarding and land on the pokedex', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()

    cy.get('[data-testid="onboarding-start"]').should('be.visible')
    cy.get('[data-testid="onboarding-skip"]').should('be.visible')

    cy.get('[data-testid="onboarding-start"]').click()

    cy.url().should('include', '/pokedex')
    cy.get('[data-testid="footer-nav"]').should('be.visible')
  })

  it('redirects returning users straight to the pokedex', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()
    cy.get('[data-testid="onboarding-start"]').click()
    cy.url().should('include', '/pokedex')

    cy.visit('/')
    cy.waitForHydration()
    cy.url({ timeout: 10_000 }).should('include', '/pokedex')
  })

  it('switches the interface language', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()

    cy.get('[data-testid="lang-en"]').click()
    cy.get('[data-testid="onboarding-start"]').should('have.text', 'Get Started')
    cy.get('[data-testid="onboarding-skip"]').should('have.text', 'Skip')

    cy.get('[data-testid="lang-es"]').click()
    cy.get('[data-testid="onboarding-start"]').should('have.text', 'Empezar')
  })
})
