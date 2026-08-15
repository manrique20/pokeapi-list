

export function useInfiniteScroll(
  target: Ref<HTMLElement | null>,
  callback: () => void,
  options?: { rootMargin?: string }
) {
  if (!import.meta.client) return

  let observer: IntersectionObserver | null = null

  function observe(el: HTMLElement | null) {
    observer?.disconnect()
    if (el) observer?.observe(el)
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callback()
      },
      { rootMargin: options?.rootMargin ?? '200px' }
    )
    observe(target.value)
  })

  watch(target, (el) => observe(el))

  onBeforeUnmount(() => observer?.disconnect())
}
