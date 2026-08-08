<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    height?: string
  }>(),
  { height: '75%' }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const drawer = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(drawer)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (props.modelValue) deactivate()
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      activate()
    } else {
      deactivate()
    }
  },
  { flush: 'post', immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="modelValue"
        ref="drawer"
        class="app-drawer"
        :style="{ '--drawer-height': props.height }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        data-testid="drawer"
      >
        <button
          type="button"
          class="app-drawer__overlay"
          tabindex="-1"
          :aria-label="$t('common.close')"
          data-testid="drawer-overlay"
          @click="close"
        />

        <section class="app-drawer__panel" data-testid="drawer-panel">
          <header class="app-drawer__header">
            <button
              type="button"
              class="app-drawer__close"
              :aria-label="$t('common.close')"
              data-testid="drawer-close"
              @click="close"
            >
              <Icon name="i-material-symbols:close-rounded" size="24" aria-hidden="true" />
            </button>
            <h2 class="app-drawer__title">{{ title }}</h2>
          </header>

          <div class="app-drawer__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="app-drawer__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
