<script setup lang="ts">
definePageMeta({ layout: 'main' })
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.pokedex.title') }}</h1>
    <p class="page__empty">{{ $t('pages.pokedex.empty') }}</p>
  </section>
</template>
