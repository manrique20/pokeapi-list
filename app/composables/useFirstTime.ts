
export function useFirstTime() {
  const flag = ref<boolean | null>(null)

  if (import.meta.client) {
    flag.value = localStorage.getItem(FIRST_TIME_STORAGE_KEY) !== 'false'
  }

  return computed<boolean>({
    get: () => flag.value ?? true,
    set: (value: boolean) => {
      flag.value = value
      if (import.meta.client) {
        localStorage.setItem(FIRST_TIME_STORAGE_KEY, String(value))
      }
    },
  })
}
