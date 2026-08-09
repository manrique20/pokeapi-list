<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    text: string
    icon?: string
  }>(),
  { icon: '/empty/ic_empty_icon.svg' }
)
</script>

<template>
  <div class="empty-state">
    <img :src="icon" alt="" class="empty-state__icon" aria-hidden="true" />
    <h2 class="empty-state__title">{{ title }}</h2>
    <p class="empty-state__text">{{ text }}</p>
    <slot name="action" />
  </div>
</template>
