<script setup lang="ts">
defineProps<{ actionLabel: string }>()
const emit = defineEmits<{ delete: [] }>()

const SWIPE_THRESHOLD = 48
const MAX_SWIPE = 80

const translateX = ref(0)
const isDragging = ref(false)
let startX = 0
let startTranslate = 0
let activePointerId: number | null = null

function onPointerDown(event: PointerEvent) {
  activePointerId = event.pointerId
  startX = event.clientX
  startTranslate = translateX.value
  isDragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== activePointerId) return
  const delta = event.clientX - startX
  translateX.value = Math.min(0, Math.max(-MAX_SWIPE, startTranslate + delta))
}

function endDrag() {
  if (!isDragging.value) return
  isDragging.value = false
  translateX.value = Math.abs(translateX.value) > SWIPE_THRESHOLD ? -MAX_SWIPE : 0
}

function handleDelete() {
  translateX.value = 0
  emit('delete')
}
</script>

<template>
  <div class="swipe-item">
    <div
      class="swipe-item__content"
      :class="{ 'is-dragging': isDragging }"
      :style="{ transform: `translateX(${translateX}px)` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <slot />
    </div>
    <div class="swipe-item__action">
      <button
        type="button"
        class="swipe-item__delete"
        :aria-label="actionLabel"
        data-testid="swipe-delete-action"
        @click="handleDelete"
      >
        <Icon name="i-material-symbols:delete-rounded" size="24" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
