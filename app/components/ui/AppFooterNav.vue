<script setup lang="ts">
export interface FooterNavItem {
  label: string
  to: string
  icon: string
}

const props = defineProps<{
  items: FooterNavItem[]
  currentPath: string
}>()

function isActive(item: FooterNavItem): boolean {
  return props.currentPath === item.to
}
</script>

<template>
  <nav class="app-footer-nav" data-testid="footer-nav" aria-label="Main navigation">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="app-footer-nav__item"
      :class="{ 'is-active': isActive(item) }"
    >
      <Icon :name="item.icon" size="26" class="app-footer-nav__icon" aria-hidden="true" />
      <span class="app-footer-nav__label">{{ $t(item.label) }}</span>
    </NuxtLink>
  </nav>
</template>
