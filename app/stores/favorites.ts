import { defineStore } from 'pinia'
import { FAVORITES_STORAGE_KEY } from '~/utils/constants'

interface FavoritesState {
  pokemonNames: string[]
}

export const useFavoritesStore = defineStore('favorites', {
  state: (): FavoritesState => ({
    pokemonNames: [],
  }),

  getters: {
    count: (state): number => state.pokemonNames.length,

    isFavorite:
      (state) =>
      (name: string): boolean =>
        state.pokemonNames.includes(name),
  },

  actions: {
    add(name: string) {
      const normalized = name.trim().toLowerCase()
      if (!normalized || this.isFavorite(normalized)) return
      this.pokemonNames.push(normalized)
    },

    remove(name: string) {
      this.pokemonNames = this.pokemonNames.filter((item) => item !== name)
    },

    toggle(name: string) {
      if (this.isFavorite(name)) {
        this.remove(name)
      } else {
        this.add(name)
      }
    },

    hydrate() {
      if (!import.meta.client) return
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (!stored) return
      try {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          this.pokemonNames = parsed.filter((item): item is string => typeof item === 'string')
        }
      } catch {
        // Corrupt stored data is ignored; the store stays empty.
      }
    },

    persist() {
      if (!import.meta.client) return
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.pokemonNames))
    },
  },
})
