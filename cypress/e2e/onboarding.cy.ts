/// <reference types="cypress" />

describe('Onboarding flow', () => {
  it('shows the splash screen on first visit and redirects to onboarding', () => {
    cy.visit('/')
    cy.waitForHydration()

    cy.get('[data-testid="splash"]').should('be.visible')
    cy.get('[data-testid="splash-loader"]').should('exist')

    cy.url({ timeout: 10_000 }).should('include', '/onboarding')
  })

  it('walks through the two steps and lands on the pokedex', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()

    cy.get('[data-testid="onboarding-title"]').should('have.text', 'Todos los Pokémon en un solo lugar')
    cy.get('[data-testid="onboarding-image"]').should('have.attr', 'src').and('include', 'ic_step_one.png')
    cy.get('[data-testid="onboarding-continue"]').should('have.text', 'Continuar')

    cy.get('[data-testid="onboarding-dot"]').eq(0).should('have.class', 'is-active')
    cy.get('[data-testid="onboarding-dot"]').eq(1).should('not.have.class', 'is-active')

    cy.get('[data-testid="onboarding-continue"]').click()

    cy.get('[data-testid="onboarding-title"]').should('have.text', 'Mantén tu Pokédex actualizada')
    cy.get('[data-testid="onboarding-image"]').should('have.attr', 'src').and('include', 'ic_step_two.png')
    cy.get('[data-testid="onboarding-continue"]').should('have.text', 'Empecemos')

    cy.get('[data-testid="onboarding-dot"]').eq(0).should('not.have.class', 'is-active')
    cy.get('[data-testid="onboarding-dot"]').eq(1).should('have.class', 'is-active')

    cy.get('[data-testid="onboarding-continue"]').click()

    cy.url().should('include', '/pokedex')
    cy.get('[data-testid="footer-nav"]').should('be.visible')
  })

  it('redirects returning users straight to the pokedex', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()
    cy.get('[data-testid="onboarding-continue"]').click()
    cy.get('[data-testid="onboarding-continue"]').click()
    cy.url().should('include', '/pokedex')

    cy.visit('/')
    cy.waitForHydration()
    cy.url({ timeout: 10_000 }).should('include', '/pokedex')
  })

  it('switches the interface language', () => {
    cy.visit('/onboarding')
    cy.waitForHydration()

    cy.get('[data-testid="lang-en"]').click()
    cy.get('[data-testid="onboarding-continue"]').should('have.text', 'Continue')
    cy.get('[data-testid="onboarding-title"]').should('have.text', 'All Pokémon in one place')

    cy.get('[data-testid="lang-es"]').click()
    cy.get('[data-testid="onboarding-continue"]').should('have.text', 'Continuar')
  })
})
