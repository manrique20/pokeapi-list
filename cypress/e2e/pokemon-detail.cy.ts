/// <reference types="cypress" />

const pokemonStub = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
  sprites: { other: { dream_world: { front_default: 'https://example.com/bulbasaur.svg' } } },
}

const speciesStub = {
  flavor_text_entries: [
    {
      flavor_text: 'Tiene una semilla de planta en la espalda desde que nace.',
      language: { name: 'es' },
    },
  ],
  genera: [{ genus: 'Pokémon Semilla', language: { name: 'es' } }],
  gender_rate: 1,
}

const abilityStub = {
  names: [{ name: 'Espesura', language: { name: 'es' } }],
}

// Real damage relations for grass/poison — verified by hand against the
// Figma capture when computeWeaknesses() was built: Fuego/Hielo/Volador/
// Psíquico, with Tierra neutralized because Planta resists it.
const grassTypeStub = {
  damage_relations: {
    double_damage_from: [
      { name: 'fire' },
      { name: 'ice' },
      { name: 'poison' },
      { name: 'flying' },
      { name: 'bug' },
    ],
    half_damage_from: [{ name: 'water' }, { name: 'electric' }, { name: 'grass' }, { name: 'ground' }],
    no_damage_from: [],
  },
}

const poisonTypeStub = {
  damage_relations: {
    double_damage_from: [{ name: 'ground' }, { name: 'psychic' }],
    half_damage_from: [
      { name: 'grass' },
      { name: 'fighting' },
      { name: 'poison' },
      { name: 'bug' },
      { name: 'fairy' },
    ],
    no_damage_from: [],
  },
}

describe('Pokémon detail page', () => {
  beforeEach(() => {
    cy.intercept('https://pokeapi.co/api/v2/pokemon/bulbasaur', { body: pokemonStub }).as('pokemonDetail')
    cy.intercept('https://pokeapi.co/api/v2/pokemon-species/bulbasaur', { body: speciesStub })
    cy.intercept('https://pokeapi.co/api/v2/ability/overgrow', { body: abilityStub })
    cy.intercept('https://pokeapi.co/api/v2/type/grass', { body: grassTypeStub })
    cy.intercept('https://pokeapi.co/api/v2/type/poison', { body: poisonTypeStub })

    cy.visit('/pokedex/bulbasaur')
    cy.waitForHydration()
    cy.wait('@pokemonDetail')
  })

  it('renders name, number, types, stats, gender and weaknesses', () => {
    cy.get('[data-testid="pokemon-detail-hero"]').should('be.visible')
    cy.contains('h1', 'Bulbasaur')
    cy.contains('N°001')

    cy.get('.type-badge').should('contain.text', 'Planta').and('contain.text', 'Veneno')

    cy.get('.stat-card').eq(0).should('contain.text', '6,9 kg')
    cy.get('.stat-card').eq(1).should('contain.text', '0,7 m')
    cy.get('.stat-card').eq(2).should('contain.text', 'Semilla')
    cy.get('.stat-card').eq(3).should('contain.text', 'Espesura')

    cy.get('.gender-bar__labels').should('contain.text', '87,5%').and('contain.text', '12,5%')

    cy.get('.pokemon-detail__weaknesses .type-badge').should('have.length', 4)
    cy.get('.pokemon-detail__weaknesses').should('contain.text', 'Fuego')
    cy.get('.pokemon-detail__weaknesses').should('contain.text', 'Hielo')
    cy.get('.pokemon-detail__weaknesses').should('contain.text', 'Volador')
    cy.get('.pokemon-detail__weaknesses').should('contain.text', 'Psíquico')
  })

  it('navigates back to the pokedex', () => {
    cy.get('[data-testid="pokemon-detail-back"]').click()
    cy.url().should('include', '/pokedex')
    cy.url().should('not.include', 'bulbasaur')
  })

  it('toggles favorite and persists it to localStorage', () => {
    cy.get('[data-testid="pokemon-detail-favorite-toggle"]').should('have.attr', 'aria-pressed', 'false')
    cy.get('[data-testid="pokemon-detail-favorite-toggle"]').click()
    cy.get('[data-testid="pokemon-detail-favorite-toggle"]').should('have.attr', 'aria-pressed', 'true')

    cy.window().then((win) => {
      const stored = JSON.parse(win.localStorage.getItem('pokeapi:favorites') ?? '[]')
      expect(stored).to.include('bulbasaur')
    })
  })

  it('shows the error state and recovers via retry', () => {
    let callCount = 0
    cy.intercept('https://pokeapi.co/api/v2/pokemon/bulbasaur', (req) => {
      callCount += 1
      if (callCount === 1) {
        req.reply({ statusCode: 500 })
      } else {
        req.reply({ body: pokemonStub })
      }
    }).as('pokemonDetailRetry')

    cy.visit('/pokedex/bulbasaur')
    cy.waitForHydration()

    cy.get('[data-testid="pokemon-detail-error"]').should('be.visible')
    cy.get('[data-testid="pokemon-detail-retry"]').click()
    cy.get('[data-testid="pokemon-detail-hero"]').should('be.visible')
  })
})
