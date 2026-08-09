<script setup lang="ts">
import type { PokemonEntry } from '~/utils/pokemon'

definePageMeta({ layout: 'main' })

const config = useRuntimeConfig()

const {
  data: pokemonListData,
  status: pokemonListStatus,
  refresh: refreshPokemonList,
} = useFetch<{ results: PokemonEntry[] }>(`${config.public.pokeApiBase}/pokemon`, {
  query: { limit: 20 },
  server: false,
  key: 'pokedex-pokemon-list',
})

const pokemonList = computed(() => pokemonListData.value?.results ?? [])
const isLoadingPokemonList = computed(
  () => pokemonListStatus.value === 'pending' || pokemonListStatus.value === 'idle'
)
const hasPokemonListError = computed(() => pokemonListStatus.value === 'error')

const {
  cache: pokemonDetails,
  isLoading: isLoadingDetails,
  hasError: hasDetailsError,
  load: loadPokemonDetails,
} = usePokemonDetails()

watch(
  pokemonListData,
  (data) => {
    if (data?.results?.length) loadPokemonDetails(data.results.map((entry) => entry.name))
  },
  { immediate: true }
)

const isLoadingPokedex = computed(() => isLoadingPokemonList.value || isLoadingDetails.value)
const hasPokedexError = computed(() => hasPokemonListError.value || hasDetailsError.value)

const enrichedPokemonList = computed(() =>
  pokemonList.value.map((entry) => ({
    ...entry,
    types: pokemonDetails.value.get(entry.name)?.types ?? [],
  }))
)

async function retryPokedex() {
  if (hasPokemonListError.value) {
    await refreshPokemonList()
  } else if (pokemonListData.value?.results) {
    await loadPokemonDetails(pokemonListData.value.results.map((entry) => entry.name))
  }
}

const searchQuery = ref('')
const isDrawerOpen = ref(false)
const isTypesOpen = ref(true)
const draftTypes = ref<string[]>([])
const appliedTypes = ref<string[]>([])
const typeCache = new Map<string, string[]>()
const isApplyingFilters = ref(false)
const filterError = ref(false)
let applyFiltersToken = 0

function toggleType(typeName: string) {
  draftTypes.value = draftTypes.value.includes(typeName)
    ? draftTypes.value.filter((t) => t !== typeName)
    : [...draftTypes.value, typeName]
}

function openDrawer() {
  draftTypes.value = [...appliedTypes.value]
  filterError.value = false
  isDrawerOpen.value = true
}

async function loadTypeMembers(typeName: string) {
  if (typeCache.has(typeName)) return
  const data = await $fetch<{ pokemon: { pokemon: { name: string } }[] }>(
    `${config.public.pokeApiBase}/type/${typeName}`
  )
  typeCache.set(
    typeName,
    data.pokemon.map(({ pokemon }) => pokemon.name)
  )
}

async function applyFilters() {
  const token = ++applyFiltersToken
  isApplyingFilters.value = true
  filterError.value = false
  try {
    await Promise.all(draftTypes.value.map(loadTypeMembers))
    if (token !== applyFiltersToken) return // superseded by a newer applyFilters() call
    appliedTypes.value = [...draftTypes.value]
    isDrawerOpen.value = false
  } catch {
    if (token === applyFiltersToken) filterError.value = true
  } finally {
    if (token === applyFiltersToken) isApplyingFilters.value = false
  }
}

const filteredPokemon = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return enrichedPokemonList.value.filter((entry) => {
    if (query && !entry.name.includes(query)) return false
    return appliedTypes.value.every((typeName) => typeCache.get(typeName)?.includes(entry.name))
  })
})
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.pokedex.title') }}</h1>

    <div v-if="isLoadingPokedex" class="pokedex-status" data-testid="pokedex-loading">
      <PokeballLoader />
    </div>

    <EmptyState
      v-else-if="hasPokedexError"
      :title="$t('pages.pokedex.errorTitle')"
      :text="$t('pages.pokedex.errorText')"
      data-testid="pokedex-error"
    >
      <template #action>
        <button
          type="button"
          class="button filter-actions__apply"
          data-testid="pokedex-retry"
          @click="retryPokedex()"
        >
          {{ $t('pages.pokedex.retry') }}
        </button>
      </template>
    </EmptyState>

    <template v-else>
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
        <li v-for="entry in filteredPokemon" :key="entry.name">
          <PokemonCard :entry="entry" :types="entry.types" />
        </li>
      </ul>

      <p
        v-if="filteredPokemon.length === 0 && pokemonList.length > 0"
        class="pokedex-list__empty"
        data-testid="pokedex-empty"
      >
        {{ $t('pages.pokedex.noResults') }}
      </p>
    </template>

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
        <p v-if="filterError" class="filter-actions__error" data-testid="filter-error">
          {{ $t('pages.pokedex.filter.error') }}
        </p>
        <button
          type="button"
          class="button filter-actions__apply"
          data-testid="filter-apply"
          :disabled="isApplyingFilters"
          :aria-busy="isApplyingFilters"
          @click="applyFilters"
        >
          {{ $t('pages.pokedex.filter.apply') }}
        </button>
        <button
          type="button"
          class="button filter-actions__cancel"
          data-testid="filter-cancel"
          :disabled="isApplyingFilters"
          @click="isDrawerOpen = false"
        >
          {{ $t('pages.pokedex.filter.cancel') }}
        </button>
      </template>
    </AppDrawer>
  </section>
</template>

<style lang="scss">
@use '~/assets/scss/components/_pokeball-loader.scss' as *;
</style>
