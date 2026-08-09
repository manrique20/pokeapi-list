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

// Shape covers both uses of GET /pokemon/{name}: the list page's
// enrichment fetch (only reads `types`) and the detail page's primary
// fetch (reads everything) — any card navigated to from these tests
// should be able to settle into a normal (non-error) detail render.
const detailStubs: Record<
  string,
  {
    id: number
    height: number
    weight: number
    types: { type: { name: string } }[]
    abilities: { ability: { name: string }; is_hidden: boolean }[]
    sprites: { other: { dream_world: { front_default: string | null } } }
  }
> = {
  pikachu: {
    id: 25,
    height: 4,
    weight: 60,
    types: [{ type: { name: 'electric' } }],
    abilities: [],
    sprites: { other: { dream_world: { front_default: null } } },
  },
  charmander: {
    id: 4,
    height: 6,
    weight: 85,
    types: [{ type: { name: 'fire' } }],
    abilities: [],
    sprites: { other: { dream_world: { front_default: null } } },
  },
  bulbasaur: {
    id: 1,
    height: 7,
    weight: 69,
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    abilities: [],
    sprites: { other: { dream_world: { front_default: null } } },
  },
  squirtle: {
    id: 7,
    height: 5,
    weight: 90,
    types: [{ type: { name: 'water' } }],
    abilities: [],
    sprites: { other: { dream_world: { front_default: null } } },
  },
  eevee: {
    id: 133,
    height: 3,
    weight: 65,
    types: [{ type: { name: 'normal' } }],
    abilities: [],
    sprites: { other: { dream_world: { front_default: null } } },
  },
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

  it('closes the drawer on Escape and returns focus to the filter button', () => {
    cy.get('[data-testid="pokedex-filter-open"]').click()
    cy.get('[data-testid="drawer-panel"]').should('be.visible')

    cy.get('body').type('{esc}')

    cy.get('[data-testid="drawer-panel"]').should('not.exist')
    cy.focused().should('have.attr', 'data-testid', 'pokedex-filter-open')
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

  it('disables the apply button while the filter request is in flight', () => {
    cy.intercept('https://pokeapi.co/api/v2/type/fire', { body: fireTypeStub, delay: 300 }).as('typeFireSlow')

    cy.get('[data-testid="pokedex-filter-open"]').click()
    cy.get('[data-testid="filter-type-fire"]').parent().click()
    cy.get('[data-testid="filter-apply"]').click()

    cy.get('[data-testid="filter-apply"]').should('be.disabled')
    cy.wait('@typeFireSlow')
    cy.get('[data-testid="drawer-panel"]').should('not.exist')
  })

  it('navigates to the pokemon detail page when tapping a card', () => {
    cy.intercept('https://pokeapi.co/api/v2/pokemon-species/pikachu', {
      body: { flavor_text_entries: [], genera: [], gender_rate: -1 },
    })
    cy.intercept('https://pokeapi.co/api/v2/type/electric', {
      body: { damage_relations: { double_damage_from: [], half_damage_from: [], no_damage_from: [] } },
    })

    cy.get('[data-testid="pokedex-item"]').first().click()
    cy.url().should('include', '/pokedex/pikachu')
  })

  it('does not navigate when tapping the favorite heart', () => {
    cy.get('[data-testid="pokedex-favorite-toggle"]').first().click()

    cy.url().should('include', '/pokedex')
    cy.url().should('not.include', '/pokedex/')
    cy.window().then((win) => {
      const stored = JSON.parse(win.localStorage.getItem('pokeapi:favorites') ?? '[]')
      expect(stored).to.include('pikachu')
    })
  })

  it('shows the error state when the list fails to load, and recovers via retry', () => {
    cy.intercept('https://pokeapi.co/api/v2/pokemon?limit=20', { statusCode: 500 }).as('pokemonListError')
    cy.visit('/pokedex')
    cy.waitForHydration()
    cy.wait('@pokemonListError')

    cy.get('[data-testid="pokedex-error"]').should('be.visible')

    cy.intercept('https://pokeapi.co/api/v2/pokemon?limit=20', { body: pokemonListStub }).as('pokemonListRetry')
    cy.get('[data-testid="pokedex-retry"]').click()
    cy.wait('@pokemonListRetry')

    cy.get('[data-testid="pokedex-list"]').should('be.visible')
    cy.get('[data-testid="pokedex-item"]').should('have.length', 5)
  })
})
