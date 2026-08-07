<script setup lang="ts">
definePageMeta({ layout: 'main' })

const favoritesStore = useFavoritesStore()
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.favorites.title') }}</h1>
    <p class="page__count" data-testid="favorites-count">
      {{ $t('pages.favorites.count', { count: favoritesStore.count }) }}
    </p>
    <p class="page__empty">{{ $t('pages.favorites.empty') }}</p>
  </section>
</template>
