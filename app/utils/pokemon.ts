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

export function spriteUrlById(id: number): string {
  return `${SPRITES_BASE_URL}/${id}.png`
}

export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// PokeAPI genus strings always follow a fixed per-locale pattern —
// "Pokémon <X>" in Spanish, "<X> Pokémon" in English — so this holds
// for any species, not just the ones we've tested.
export function formatGenus(genus: string, locale: string): string {
  return locale === 'es' ? genus.replace(/^Pokémon\s+/i, '') : genus.replace(/\s+Pokémon$/i, '')
}

// PokeAPI flavor text entries contain literal newline/form-feed
// characters meant for the in-game textbox layout; collapse them
// into spaces for a normal HTML paragraph.
export function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r]+/g, ' ')
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
  rock: 'i-material-symbols:landscape-2-rounded',
  ghost: 'i-material-symbols:sentiment-very-dissatisfied-rounded',
  dragon: 'i-material-symbols:local-fire-department-rounded',
  dark: 'i-material-symbols:dark-mode-rounded',
  steel: 'i-material-symbols:shield-rounded',
  fairy: 'i-material-symbols:auto-awesome-rounded',
}

export function typeIcon(typeName: string): string {
  return POKEMON_TYPE_ICONS[typeName] ?? 'i-material-symbols:circle-outline'
}
