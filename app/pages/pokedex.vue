<script setup lang="ts">
definePageMeta({ layout: 'main' })

interface PokemonEntry {
  name: string
  url: string
}

const POKEMON_TYPES = [
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

const pokemonList = ref<PokemonEntry[]>([])
const searchQuery = ref('')
const isDrawerOpen = ref(false)
const isTypesOpen = ref(true)
const draftTypes = ref<string[]>([])
const appliedTypes = ref<string[]>([])
const typeCache = new Map<string, string[]>()

function entryId(entry: PokemonEntry): string {
  return entry.url.match(/\/pokemon\/(\d+)\//)?.[1] ?? '0'
}

function entryNumber(entry: PokemonEntry): string {
  return `#${entryId(entry).padStart(3, '0')}`
}

function spriteUrl(entry: PokemonEntry): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entryId(entry)}.png`
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function toggleType(typeName: string) {
  draftTypes.value = draftTypes.value.includes(typeName)
    ? draftTypes.value.filter((t) => t !== typeName)
    : [...draftTypes.value, typeName]
}

function openDrawer() {
  draftTypes.value = [...appliedTypes.value]
  isDrawerOpen.value = true
}

async function loadTypeMembers(typeName: string) {
  if (typeCache.has(typeName)) return
  const data = await $fetch<{ pokemon: { pokemon: { name: string } }[] }>(
    `https://pokeapi.co/api/v2/type/${typeName}`
  )
  typeCache.set(
    typeName,
    data.pokemon.map(({ pokemon }) => pokemon.name)
  )
}

async function applyFilters() {
  await Promise.all(draftTypes.value.map(loadTypeMembers))
  appliedTypes.value = [...draftTypes.value]
  isDrawerOpen.value = false
}

const filteredPokemon = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return pokemonList.value.filter((entry) => {
    if (query && !entry.name.includes(query)) return false
    return appliedTypes.value.every((typeName) => typeCache.get(typeName)?.includes(entry.name))
  })
})

onMounted(async () => {
  const data = await $fetch<{ results: PokemonEntry[] }>(
    'https://pokeapi.co/api/v2/pokemon?limit=20'
  )
  pokemonList.value = data.results
})
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.pokedex.title') }}</h1>

    <div class="pokedex-toolbar">
      <label class="pokedex-search">
        <span class="sr-only">{{ $t('pages.pokedex.search.label') }}</span>
        <Icon
          name="i-material-symbols:search-rounded"
          size="20"
          class="pokedex-search__icon"
          aria-hidden="true"
        />
        <input
          v-model="searchQuery"
          type="search"
          class="pokedex-search__input"
          :placeholder="$t('pages.pokedex.search.placeholder')"
          data-testid="pokedex-search"
        />
      </label>

      <button
        type="button"
        class="pokedex-filter-btn"
        :aria-label="$t('pages.pokedex.filter.open')"
        data-testid="pokedex-filter-open"
        @click="openDrawer"
      >
        <Icon name="i-material-symbols:tune-rounded" size="24" aria-hidden="true" />
      </button>
    </div>

    <ul class="pokedex-list" data-testid="pokedex-list">
      <li
        v-for="entry in filteredPokemon"
        :key="entry.name"
        class="pokedex-list__item"
        data-testid="pokedex-item"
      >
        <img
          :src="spriteUrl(entry)"
          :alt="entry.name"
          class="pokedex-list__sprite"
          width="56"
          height="56"
          loading="lazy"
        />
        <span class="pokedex-list__number">{{ entryNumber(entry) }}</span>
        <span class="pokedex-list__name">{{ capitalize(entry.name) }}</span>
      </li>
    </ul>

    <p v-if="filteredPokemon.length === 0 && pokemonList.length > 0" class="pokedex-list__empty" data-testid="pokedex-empty">
      {{ $t('pages.pokedex.noResults') }}
    </p>

    <AppDrawer v-model="isDrawerOpen" :title="$t('pages.pokedex.filter.title')">
      <div class="filter-types">
        <button
          type="button"
          class="filter-types__header"
          data-testid="filter-types-toggle"
          @click="isTypesOpen = !isTypesOpen"
        >
          <span>{{ $t('pages.pokedex.filter.types') }}</span>
          <Icon
            name="i-material-symbols:keyboard-arrow-down-rounded"
            size="24"
            class="filter-types__chevron"
            :class="{ 'is-open': isTypesOpen }"
            aria-hidden="true"
          />
        </button>

        <Transition name="collapse">
          <div v-if="isTypesOpen" class="filter-types__list" data-testid="filter-types-list">
            <label v-for="typeName in POKEMON_TYPES" :key="typeName" class="filter-type">
              <input
                type="checkbox"
                class="filter-type__input sr-only"
                :checked="draftTypes.includes(typeName)"
                :data-testid="`filter-type-${typeName}`"
                @change="toggleType(typeName)"
              />
              <span class="filter-type__box" aria-hidden="true">
                <Icon
                  v-if="draftTypes.includes(typeName)"
                  name="i-material-symbols:check-rounded"
                  size="14"
                />
              </span>
              <span class="filter-type__label">
                {{ $t(`pages.pokedex.filter.typeNames.${typeName}`) }}
              </span>
            </label>
          </div>
        </Transition>
      </div>

      <template #footer>
        <button
          type="button"
          class="button filter-actions__apply"
          data-testid="filter-apply"
          @click="applyFilters"
        >
          {{ $t('pages.pokedex.filter.apply') }}
        </button>
        <button
          type="button"
          class="button filter-actions__cancel"
          data-testid="filter-cancel"
          @click="isDrawerOpen = false"
        >
          {{ $t('pages.pokedex.filter.cancel') }}
        </button>
      </template>
    </AppDrawer>
  </section>
</template>
