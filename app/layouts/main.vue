<script setup lang="ts">
import type { FooterNavItem } from '~/components/ui/AppFooterNav.vue'

const route = useRoute()

const navItems: FooterNavItem[] = [
  {
    label: 'footer.pokedex',
    to: '/pokedex',
    icon: 'i-material-symbols:home-rounded',
  },
  {
    label: 'footer.regions',
    to: '/regions',
    icon: 'i-material-symbols:public-rounded',
  },
  {
    label: 'footer.favorites',
    to: '/favorites',
    icon: 'i-material-symbols:favorite-rounded',
  },
  {
    label: 'footer.profile',
    to: '/profile',
    icon: 'i-material-symbols:person-rounded',
  },
]
</script>

<template>
  <div class="app-shell">
    <main class="app-shell__content">
      <slot />
    </main>
    <AppFooterNav :items="navItems" :current-path="route.path" />
  </div>
</template>
