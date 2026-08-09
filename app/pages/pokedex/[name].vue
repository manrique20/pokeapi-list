<script setup lang="ts">
import type { DamageRelations } from '~/utils/type-chart'

definePageMeta({ layout: 'main' })

interface PokemonDetailResponse {
  id: number
  name: string
  height: number
  weight: number
  types: { type: { name: string } }[]
  abilities: { ability: { name: string }; is_hidden: boolean }[]
  sprites: {
    other: {
      dream_world: {
        front_default: string | null
      }
    }
  }
}

interface SpeciesResponse {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[]
  genera: { genus: string; language: { name: string } }[]
  gender_rate: number
}

interface AbilityResponse {
  names: { name: string; language: { name: string } }[]
}

const route = useRoute()
const config = useRuntimeConfig()
const { locale } = useI18n()
const favoritesStore = useFavoritesStore()
const name = String(route.params.name)

const {
  data: pokemon,
  status: pokemonStatus,
  refresh: refreshPokemon,
} = useFetch<PokemonDetailResponse>(`${config.public.pokeApiBase}/pokemon/${name}`, {
  server: false,
  key: `pokemon-detail-${name}`,
})

const species = ref<SpeciesResponse | null>(null)
const abilityName = ref('')
const weaknesses = ref<string[]>([])
const isLoadingExtras = ref(false)
const hasExtrasError = ref(false)

async function loadExtras(detail: PokemonDetailResponse) {
  isLoadingExtras.value = true
  hasExtrasError.value = false
  try {
    const firstAbility =
      detail.abilities.find((a) => !a.is_hidden)?.ability.name ?? detail.abilities[0]?.ability.name

    const [speciesData, abilityData, typeData] = await Promise.all([
      $fetch<SpeciesResponse>(`${config.public.pokeApiBase}/pokemon-species/${name}`),
      firstAbility
        ? $fetch<AbilityResponse>(`${config.public.pokeApiBase}/ability/${firstAbility}`)
        : Promise.resolve(null),
      Promise.all(
        detail.types.map((t) =>
          $fetch<{ damage_relations: DamageRelations }>(
            `${config.public.pokeApiBase}/type/${t.type.name}`
          )
        )
      ),
    ])

    species.value = speciesData
    abilityName.value =
      abilityData?.names.find((n) => n.language.name === locale.value)?.name ??
      capitalize(firstAbility ?? '')
    weaknesses.value = computeWeaknesses(typeData.map((t) => t.damage_relations))
  } catch {
    hasExtrasError.value = true
  } finally {
    isLoadingExtras.value = false
  }
}

watch(
  pokemon,
  (value) => {
    if (value) loadExtras(value)
  },
  { immediate: true }
)

const isLoading = computed(
  () =>
    pokemonStatus.value === 'pending' || pokemonStatus.value === 'idle' || isLoadingExtras.value
)
const hasError = computed(() => pokemonStatus.value === 'error' || hasExtrasError.value)

const primaryType = computed(() => pokemon.value?.types[0]?.type.name ?? 'normal')
const isFavorite = computed(() => favoritesStore.isFavorite(name))

// Dream World artwork is much higher-res than the pixel sprite, but it's
// missing for some newer Pokémon — fall back to the pixel sprite then.
const heroSpriteUrl = computed(() => {
  if (!pokemon.value) return ''
  return pokemon.value.sprites.other.dream_world.front_default ?? spriteUrlById(pokemon.value.id)
})

const description = computed(() => {
  const entry = species.value?.flavor_text_entries.find((e) => e.language.name === locale.value)
  return entry ? cleanFlavorText(entry.flavor_text) : ''
})

const genus = computed(() => {
  const entry = species.value?.genera.find((g) => g.language.name === locale.value)
  return entry ? formatGenus(entry.genus, locale.value) : ''
})

const genderRate = computed(() => species.value?.gender_rate ?? -1)
const femalePercent = computed(() => (genderRate.value / 8) * 100)
const malePercent = computed(() => 100 - femalePercent.value)

function formatPercent(value: number): string {
  return value.toLocaleString(locale.value, { maximumFractionDigits: 1 })
}

const statCards = computed(() => [
  {
    icon: 'i-material-symbols:monitor-weight-outline-rounded',
    labelKey: 'pages.pokemonDetail.weight',
    value: `${((pokemon.value?.weight ?? 0) / 10).toLocaleString(locale.value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kg`,
  },
  {
    icon: 'i-material-symbols:straighten-rounded',
    labelKey: 'pages.pokemonDetail.height',
    value: `${((pokemon.value?.height ?? 0) / 10).toLocaleString(locale.value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} m`,
  },
  { icon: 'i-material-symbols:category-rounded', labelKey: 'pages.pokemonDetail.category', value: genus.value },
  { icon: 'i-material-symbols:bolt-rounded', labelKey: 'pages.pokemonDetail.ability', value: abilityName.value },
])

function goBack() {
  navigateTo('/pokedex')
}

async function retry() {
  if (pokemonStatus.value === 'error') {
    await refreshPokemon()
  } else if (pokemon.value) {
    await loadExtras(pokemon.value)
  }
}
</script>

<template>
  <section class="page pokemon-detail">
    <div v-if="isLoading" class="pokedex-status" data-testid="pokemon-detail-loading">
      <PokeballLoader />
    </div>

    <EmptyState
      v-else-if="hasError"
      :title="$t('pages.pokedex.errorTitle')"
      :text="$t('pages.pokedex.errorText')"
      data-testid="pokemon-detail-error"
    >
      <template #action>
        <button
          type="button"
          class="button filter-actions__apply"
          data-testid="pokemon-detail-retry"
          @click="retry"
        >
          {{ $t('pages.pokedex.retry') }}
        </button>
      </template>
    </EmptyState>

    <template v-else-if="pokemon">
      <div class="pokemon-detail__hero" data-testid="pokemon-detail-hero">
        <div
          class="pokemon-detail__hero-circle"
          :class="`pokemon-detail__hero-circle--${primaryType}`"
          aria-hidden="true"
        />
        <button
          type="button"
          class="pokemon-detail__back"
          :aria-label="$t('common.back')"
          data-testid="pokemon-detail-back"
          @click="goBack"
        >
          <Icon name="i-material-symbols:arrow-back-rounded" size="24" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="pokemon-detail__favorite"
          :class="{ 'is-active': isFavorite }"
          :aria-pressed="isFavorite"
          :aria-label="
            $t(isFavorite ? 'pages.pokedex.unfavorite' : 'pages.pokedex.favorite', {
              name: capitalize(pokemon.name),
            })
          "
          data-testid="pokemon-detail-favorite-toggle"
          @click="favoritesStore.toggle(pokemon.name)"
        >
          <Icon
            :name="
              isFavorite
                ? 'i-material-symbols:favorite-rounded'
                : 'i-material-symbols:favorite-outline-rounded'
            "
            size="22"
            aria-hidden="true"
          />
        </button>
        <Icon
          :name="typeIcon(primaryType)"
          class="pokemon-detail__hero-icon"
          aria-hidden="true"
        />
        <img
          :src="heroSpriteUrl"
          :alt="pokemon.name"
          class="pokemon-detail__sprite"
          width="160"
          height="160"
        />
      </div>

      <h1 class="pokemon-detail__name">{{ capitalize(pokemon.name) }}</h1>
      <p class="pokemon-detail__number">
        {{ $t('pages.pokedex.number', { id: String(pokemon.id).padStart(3, '0') }) }}
      </p>

      <ul class="pokemon-card__types">
        <li
          v-for="t in pokemon.types"
          :key="t.type.name"
          class="type-badge"
          :class="`type-badge--${t.type.name}`"
        >
          <Icon :name="typeIcon(t.type.name)" size="14" aria-hidden="true" />
          {{ $t(`pages.pokedex.filter.typeNames.${t.type.name}`) }}
        </li>
      </ul>

      <p v-if="description" class="pokemon-detail__description">{{ description }}</p>

      <div class="pokemon-detail__stats">
        <div v-for="stat in statCards" :key="stat.labelKey" class="stat-card">
          <span class="stat-card__label">
            <Icon :name="stat.icon" size="16" aria-hidden="true" />
            {{ $t(stat.labelKey) }}
          </span>
          <span class="stat-card__value">{{ stat.value }}</span>
        </div>
      </div>

      <div v-if="genderRate >= 0" class="pokemon-detail__gender">
        <h2 class="pokemon-detail__section-title">{{ $t('pages.pokemonDetail.gender') }}</h2>
        <div class="gender-bar">
          <div class="gender-bar__male" :style="{ width: malePercent + '%' }" />
          <div class="gender-bar__female" :style="{ width: femalePercent + '%' }" />
        </div>
        <div class="gender-bar__labels">
          <span>♂ {{ formatPercent(malePercent) }}%</span>
          <span>♀ {{ formatPercent(femalePercent) }}%</span>
        </div>
      </div>

      <div v-if="weaknesses.length" class="pokemon-detail__weaknesses">
        <h2 class="pokemon-detail__section-title">{{ $t('pages.pokemonDetail.weaknesses') }}</h2>
        <ul class="pokemon-card__types">
          <li
            v-for="typeName in weaknesses"
            :key="typeName"
            class="type-badge"
            :class="`type-badge--${typeName}`"
          >
            <Icon :name="typeIcon(typeName)" size="14" aria-hidden="true" />
            {{ $t(`pages.pokedex.filter.typeNames.${typeName}`) }}
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style lang="scss">
@use '~/assets/scss/components/_pokeball-loader.scss' as *;
</style>
