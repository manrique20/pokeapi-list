/// <reference types="cypress" />

describe('Favorites store persistence', () => {
  beforeEach(() => {
    cy.visit('/onboarding')
    cy.waitForHydration()
    cy.get('[data-testid="onboarding-start"]').click()
  })

  it('starts with an empty list of favorites', () => {
    cy.visit('/favorites')
    cy.waitForHydration()
    cy.get('[data-testid="favorites-count"]').should('contain.text', '0')
  })

  it('hydrates favorites from localStorage on boot', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('pokeapi:favorites', JSON.stringify(['pikachu', 'bulbasaur']))
    })

    cy.reload()
    cy.visit('/favorites')
    cy.waitForHydration()

    cy.get('[data-testid="favorites-count"]').should('contain.text', '2')
  })

  it('keeps favorites when navigating between sections', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('pokeapi:favorites', JSON.stringify(['charmander']))
    })
    cy.reload()

    cy.visit('/favorites')
    cy.waitForHydration()
    cy.get('[data-testid="favorites-count"]').should('contain.text', '1')

    cy.get('a[href="/pokedex"]').click()
    cy.get('a[href="/favorites"]').click()

    cy.get('[data-testid="favorites-count"]').should('contain.text', '1')
  })

  it('ignores corrupt localStorage data', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('pokeapi:favorites', '{not-valid-json')
    })
    cy.reload()
    cy.visit('/favorites')
    cy.waitForHydration()

    cy.get('[data-testid="favorites-count"]').should('contain.text', '0')
  })
})
