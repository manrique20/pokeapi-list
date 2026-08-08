/// <reference types="cypress" />

const pokemonListStub = {
  results: [
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
    { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' },
  ],
}

const fireTypeStub = {
  pokemon: [{ pokemon: { name: 'charmander', url: '' } }],
}

const detailStubs: Record<string, { types: { type: { name: string } }[] }> = {
  pikachu: { types: [{ type: { name: 'electric' } }] },
  charmander: { types: [{ type: { name: 'fire' } }] },
  bulbasaur: { types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }] },
  squirtle: { types: [{ type: { name: 'water' } }] },
  eevee: { types: [{ type: { name: 'normal' } }] },
}

describe('Pokédex list & filters', () => {
  beforeEach(() => {
    cy.intercept('https://pokeapi.co/api/v2/pokemon?limit=20', { body: pokemonListStub }).as('pokemonList')
    cy.intercept('https://pokeapi.co/api/v2/type/fire', { body: fireTypeStub }).as('typeFire')
    cy.intercept('https://pokeapi.co/api/v2/pokemon/*', (req) => {
      const name = req.url.split('/').filter(Boolean).pop() ?? ''
      req.reply({ body: detailStubs[name] })
    }).as('pokemonDetail')

    cy.visit('/pokedex')
    cy.waitForHydration()
    cy.wait('@pokemonList')
  })

  it('renders the Pokémon list', () => {
    cy.get('[data-testid="pokedex-item"]').should('have.length', 5)
    cy.get('[data-testid="pokedex-item"]').first().should('contain.text', 'N°025')
    cy.get('[data-testid="pokedex-item"]').contains('Pikachu')
    cy.get('[data-testid="pokedex-item"]').contains('Charmander')
  })

  it('filters the list by search text', () => {
    cy.get('[data-testid="pokedex-search"]').type('charm')

    cy.get('[data-testid="pokedex-item"]').should('have.length', 1)
    cy.get('[data-testid="pokedex-item"]').contains('Charmander')

    cy.get('[data-testid="pokedex-search"]').clear()
    cy.get('[data-testid="pokedex-item"]').should('have.length', 5)
  })

  it('opens and closes the filter drawer', () => {
    cy.get('[data-testid="pokedex-filter-open"]').click()

    cy.get('[data-testid="drawer-panel"]').should('be.visible')
    cy.get('[data-testid="drawer-panel"]').contains('Filtra por tus preferencias')
    cy.get('[data-testid="filter-types-list"]').should('be.visible')
    cy.get('[data-testid="filter-type-fire"]').should('exist')

    cy.get('[data-testid="drawer-close"]').click()
    cy.get('[data-testid="drawer-panel"]').should('not.exist')
  })

  it('collapses and expands the types accordion', () => {
    cy.get('[data-testid="pokedex-filter-open"]').click()

    cy.get('[data-testid="filter-types-toggle"]').click()
    cy.get('[data-testid="filter-types-list"]').should('not.exist')

    cy.get('[data-testid="filter-types-toggle"]').click()
    cy.get('[data-testid="filter-types-list"]').should('be.visible')
  })

  it('applies the type filter and cancel keeps it unchanged', () => {
    cy.get('[data-testid="pokedex-filter-open"]').click()
    cy.get('[data-testid="filter-type-fire"]').parent().click()
    cy.get('[data-testid="filter-apply"]').click()

    cy.get('[data-testid="drawer-panel"]').should('not.exist')
    cy.get('[data-testid="pokedex-item"]').should('have.length', 1)
    cy.get('[data-testid="pokedex-item"]').contains('Charmander')

    cy.get('[data-testid="pokedex-filter-open"]').click()
    cy.get('[data-testid="filter-type-water"]').parent().click()
    cy.get('[data-testid="filter-cancel"]').click()

    cy.get('[data-testid="drawer-panel"]').should('not.exist')
    cy.get('[data-testid="pokedex-item"]').should('have.length', 1)
    cy.get('[data-testid="pokedex-item"]').contains('Charmander')
  })
})
