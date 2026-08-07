// ============================================================
// FAVORITES PERSISTENCE (client-only plugin)
// Hydrates the favorites store from localStorage on boot and
// writes back on every change.
// ============================================================

import { useFavoritesStore } from '~/stores/favorites'

export default defineNuxtPlugin(() => {
  const favoritesStore = useFavoritesStore()

  favoritesStore.hydrate()
  favoritesStore.$subscribe((_mutation, _state) => {
    favoritesStore.persist()
  })
})
