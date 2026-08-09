/// <reference types="cypress" />

const detailStubs: Record<string, { id: number; types: { type: { name: string } }[] }> = {
  pikachu: { id: 25, types: [{ type: { name: 'electric' } }] },
  charmander: { id: 4, types: [{ type: { name: 'fire' } }] },
  bulbasaur: { id: 1, types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }] },
}

describe('Favorites store persistence', () => {
  beforeEach(() => {
    cy.intercept('https://pokeapi.co/api/v2/pokemon/*', (req) => {
      const name = req.url.split('/').filter(Boolean).pop() ?? ''
      req.reply({ body: detailStubs[name] })
    }).as('pokemonDetail')

    cy.visit('/onboarding')
    cy.waitForHydration()
    cy.get('[data-testid="onboarding-continue"]').click()
    cy.get('[data-testid="onboarding-continue"]').click()
  })

  it('starts with an empty list of favorites', () => {
    cy.visit('/favorites')
    cy.waitForHydration()
    cy.get('[data-testid="favorites-count"]').should('contain.text', '0')
    cy.get('[data-testid="favorites-empty"]').should('be.visible')
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

  it('navigates back to the pokedex', () => {
    cy.visit('/favorites')
    cy.waitForHydration()

    cy.get('[data-testid="favorites-back"]').click()
    cy.url().should('include', '/pokedex')
  })

  it('renders favorite cards and removes one via the delete action', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('pokeapi:favorites', JSON.stringify(['pikachu', 'charmander']))
    })
    cy.reload()

    cy.visit('/favorites')
    cy.waitForHydration()

    cy.get('[data-testid="pokedex-item"]').should('have.length', 2)
    cy.get('[data-testid="pokedex-item"]').contains('Pikachu')
    cy.get('[data-testid="pokedex-item"]').contains('Charmander')

    cy.get('[data-testid="swipe-delete-action"]').first().click({ force: true })

    cy.get('[data-testid="favorites-count"]').should('contain.text', '1')
    cy.get('[data-testid="pokedex-item"]').should('have.length', 1)
  })

  it('shows the error state when the detail fetch fails, and recovers via retry', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('pokeapi:favorites', JSON.stringify(['pikachu']))
    })

    cy.intercept('https://pokeapi.co/api/v2/pokemon/*', { statusCode: 500 }).as('pokemonDetailError')
    cy.reload()
    cy.visit('/favorites')
    cy.waitForHydration()
    cy.wait('@pokemonDetailError')

    cy.get('[data-testid="favorites-error"]').should('be.visible')

    cy.intercept('https://pokeapi.co/api/v2/pokemon/*', (req) => {
      const name = req.url.split('/').filter(Boolean).pop() ?? ''
      req.reply({ body: detailStubs[name] })
    }).as('pokemonDetailRetry')
    cy.get('[data-testid="favorites-retry"]').click()
    cy.wait('@pokemonDetailRetry')

    cy.get('[data-testid="pokedex-item"]').should('have.length', 1)
  })
})
