<script setup lang="ts">
definePageMeta({ layout: 'main' })
</script>

<template>
  <section class="page">
    <h1 class="page__title">{{ $t('pages.profile.title') }}</h1>
    <EmptyState
      icon="/empty/ic_comming_soon.svg"
      :title="$t('pages.profile.emptyTitle')"
      :text="$t('pages.profile.emptyText')"
      data-testid="profile-empty"
    />
  </section>
</template>
