// ============================================================
// POKEMON UTILS
// Pure formatting helpers for Pokémon list entries (id, display
// number, sprite URL, display name). Framework-agnostic, testable.
// ============================================================

export interface PokemonEntry {
  name: string
  url: string
}

const SPRITES_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export function entryId(entry: PokemonEntry): string {
  return entry.url.match(/\/pokemon\/(\d+)\//)?.[1] ?? '0'
}

export function entryNumber(entry: PokemonEntry): string {
  return entryId(entry).padStart(3, '0')
}

export function spriteUrl(entry: PokemonEntry): string {
  return `${SPRITES_BASE_URL}/${entryId(entry)}.png`
}

export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// Best-effort Material Symbols per Pokémon type — approximates the custom
// icon set from the Figma design; safe to swap for closer matches later.
const POKEMON_TYPE_ICONS: Record<string, string> = {
  normal: 'i-material-symbols:circle-outline',
  fire: 'i-material-symbols:local-fire-department-rounded',
  water: 'i-material-symbols:water-drop-rounded',
  electric: 'i-material-symbols:bolt-rounded',
  grass: 'i-material-symbols:eco-rounded',
  ice: 'i-material-symbols:ac-unit-rounded',
  fighting: 'i-material-symbols:sports-martial-arts-rounded',
  poison: 'i-material-symbols:science-rounded',
  ground: 'i-material-symbols:landscape-rounded',
  flying: 'i-material-symbols:air-rounded',
  psychic: 'i-material-symbols:psychology-rounded',
  bug: 'i-material-symbols:bug-report-rounded',
  rock: 'i-material-symbols:terrain-rounded',
  ghost: 'i-material-symbols:sentiment-very-dissatisfied-rounded',
  dragon: 'i-material-symbols:local-fire-department-rounded',
  dark: 'i-material-symbols:dark-mode-rounded',
  steel: 'i-material-symbols:shield-rounded',
  fairy: 'i-material-symbols:auto-awesome-rounded',
}

export function typeIcon(typeName: string): string {
  return POKEMON_TYPE_ICONS[typeName] ?? 'i-material-symbols:circle-outline'
}
