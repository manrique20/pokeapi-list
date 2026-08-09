<script setup lang="ts">
definePageMeta({ layout: 'main' })
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.regions.title') }}</h1>
    <EmptyState
      icon="/empty/ic_comming_soon.svg"
      :title="$t('pages.regions.emptyTitle')"
      :text="$t('pages.regions.emptyText')"
      data-testid="regions-empty"
    />
  </section>
</template>
