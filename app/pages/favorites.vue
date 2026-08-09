<script setup lang="ts">
import { capitalize } from '~/utils/pokemon'

definePageMeta({ layout: 'main' })

const config = useRuntimeConfig()
const favoritesStore = useFavoritesStore()
const { cache: pokemonDetails, isLoading, hasError, load } = usePokemonDetails()

watch(
  () => favoritesStore.pokemonNames,
  (names) => {
    if (names.length) load(names)
  },
  { immediate: true }
)

const favoriteEntries = computed(() =>
  favoritesStore.pokemonNames.map((name) => {
    const detail = pokemonDetails.value.get(name)
    return {
      name,
      url: detail ? `${config.public.pokeApiBase}/pokemon/${detail.id}/` : '',
      types: detail?.types ?? [],
    }
  })
)

function goBack() {
  navigateTo('/pokedex')
}

async function retryFavorites() {
  await load(favoritesStore.pokemonNames)
}
</script>

<template>
  <section class="page">
    <div class="page__header">
      <button
        type="button"
        class="page__back"
        :aria-label="$t('common.back')"
        data-testid="favorites-back"
        @click="goBack"
      >
        <Icon name="i-material-symbols:arrow-back-rounded" size="24" aria-hidden="true" />
      </button>
      <h1 class="page__title">{{ $t('pages.favorites.title') }}</h1>
    </div>

    <p class="page__count" data-testid="favorites-count">
      {{ $t('pages.favorites.count', { count: favoritesStore.count }) }}
    </p>

    <div v-if="isLoading" class="pokedex-status" data-testid="favorites-loading">
      <PokeballLoader />
    </div>

    <EmptyState
      v-else-if="hasError"
      :title="$t('pages.pokedex.errorTitle')"
      :text="$t('pages.pokedex.errorText')"
      data-testid="favorites-error"
    >
      <template #action>
        <button
          type="button"
          class="button filter-actions__apply"
          data-testid="favorites-retry"
          @click="retryFavorites"
        >
          {{ $t('pages.pokedex.retry') }}
        </button>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="favoritesStore.count === 0"
      :title="$t('pages.favorites.emptyTitle')"
      :text="$t('pages.favorites.emptyText')"
      data-testid="favorites-empty"
    />

    <TransitionGroup
      v-else
      tag="ul"
      name="favorite-remove"
      class="pokedex-list"
      data-testid="favorites-list"
    >
      <li v-for="entry in favoriteEntries" :key="entry.name">
        <SwipeToDeleteItem
          :action-label="$t('pages.pokedex.unfavorite', { name: capitalize(entry.name) })"
          @delete="favoritesStore.remove(entry.name)"
        >
          <PokemonCard :entry="entry" :types="entry.types" />
        </SwipeToDeleteItem>
      </li>
    </TransitionGroup>
  </section>
</template>
