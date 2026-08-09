// ============================================================
// TYPE CHART
// The 18 canonical Pokémon types, and a pure helper to compute
// which types a Pokémon is weak against given the full damage
// relations of each of its own types. Combines multipliers across
// types (e.g. Grass resists Ground 0.5x, Poison is weak to Ground
// 2x — net 1x, not a weakness) rather than naively unioning each
// type's own double-damage-from list.
// ============================================================

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

export interface DamageRelations {
  double_damage_from: { name: string }[]
  half_damage_from: { name: string }[]
  no_damage_from: { name: string }[]
}

export function computeWeaknesses(relations: DamageRelations[]): string[] {
  return POKEMON_TYPES.filter((attackingType) => {
    const multiplier = relations.reduce((acc, rel) => {
      if (rel.no_damage_from.some((t) => t.name === attackingType)) return acc * 0
      if (rel.double_damage_from.some((t) => t.name === attackingType)) return acc * 2
      if (rel.half_damage_from.some((t) => t.name === attackingType)) return acc * 0.5
      return acc
    }, 1)
    return multiplier > 1
  })
}
