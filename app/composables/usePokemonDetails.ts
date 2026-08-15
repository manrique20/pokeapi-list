

export interface PokemonDetail {
  id: number
  types: string[]
}

export function usePokemonDetails() {
  const config = useRuntimeConfig()
  const cache = ref(new Map<string, PokemonDetail>())
  const isLoading = ref(false)
  const hasError = ref(false)

  async function load(names: string[]) {
    const pending = names.filter((name) => !cache.value.has(name))
    if (pending.length === 0) return

    isLoading.value = true
    hasError.value = false
    try {
      const results = await Promise.all(
        pending.map(async (name) => ({
          name,
          detail: await $fetch<{ id: number; types: { type: { name: string } }[] }>(
            `${config.public.pokeApiBase}/pokemon/${name}`
          ),
        }))
      )
      results.forEach(({ name, detail }) => {
        cache.value.set(name, { id: detail.id, types: detail.types.map((t) => t.type.name) })
      })
    } catch {
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  return { cache, isLoading, hasError, load }
}
