<script setup lang="ts">
import type { PokemonEntry } from '~/utils/pokemon'

const props = defineProps<{
  entry: PokemonEntry
  types: string[]
}>()

const favoritesStore = useFavoritesStore()
const isFavorite = computed(() => favoritesStore.isFavorite(props.entry.name))
const primaryType = computed(() => props.types[0] ?? 'normal')
</script>

<template>
  <NuxtLink
    :to="`/pokedex/${entry.name}`"
    class="pokemon-card"
    :class="`pokemon-card--${primaryType}`"
    data-testid="pokedex-item"
  >
    <div class="pokemon-card__info">
      <span class="pokemon-card__number">
        {{ $t('pages.pokedex.number', { id: entryNumber(entry) }) }}
      </span>
      <h2 class="pokemon-card__name">{{ capitalize(entry.name) }}</h2>
      <ul class="pokemon-card__types">
        <li
          v-for="typeName in types"
          :key="typeName"
          class="type-badge"
          :class="`type-badge--${typeName}`"
        >
          <Icon :name="typeIcon(typeName)" size="14" aria-hidden="true" />
          {{ $t(`pages.pokedex.filter.typeNames.${typeName}`) }}
        </li>
      </ul>
    </div>

    <div class="pokemon-card__art">
      <Icon
        :name="typeIcon(primaryType)"
        size="88"
        class="pokemon-card__art-icon"
        aria-hidden="true"
      />
      <button
        type="button"
        class="pokemon-card__favorite"
        :class="{ 'is-active': isFavorite }"
        :aria-pressed="isFavorite"
        :aria-label="
          $t(isFavorite ? 'pages.pokedex.unfavorite' : 'pages.pokedex.favorite', {
            name: capitalize(entry.name),
          })
        "
        data-testid="pokedex-favorite-toggle"
        @click.stop="favoritesStore.toggle(entry.name)"
      >
        <Icon
          :name="
            isFavorite
              ? 'i-material-symbols:favorite-rounded'
              : 'i-material-symbols:favorite-outline-rounded'
          "
          size="18"
          aria-hidden="true"
        />
      </button>
      <img
        :src="spriteUrl(entry)"
        :alt="entry.name"
        class="pokemon-card__sprite"
        width="96"
        height="96"
        loading="lazy"
      />
    </div>
  </NuxtLink>
</template>
