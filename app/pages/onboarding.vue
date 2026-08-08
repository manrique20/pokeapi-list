<script setup lang="ts">
const isFirstTime = useFirstTime()
const { locale, locales, setLocale } = useI18n()

const steps = [
  { image: '/onboarding/ic_step_one.png', title: 'onboarding.step1.title', text: 'onboarding.step1.text' },
  { image: '/onboarding/ic_step_two.png', title: 'onboarding.step2.title', text: 'onboarding.step2.text' },
]
const currentStep = ref(0)
const step = computed(() => steps[currentStep.value]!)

function next() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    isFirstTime.value = false
    navigateTo('/pokedex')
  }
}
</script>

<template>
  <main class="onboarding">
    <div class="onboarding__lang">
      <button
        v-for="localeOption in locales"
        :key="localeOption.code"
        type="button"
        class="lang-button"
        :class="{ 'is-active': locale === localeOption.code }"
        :data-testid="`lang-${localeOption.code}`"
        @click="setLocale(localeOption.code)"
      >
        {{ localeOption.name }}
      </button>
    </div>

    <section class="onboarding__step">
      <img
        class="onboarding__image"
        :src="step.image"
        :alt="$t(step.title)"
        data-testid="onboarding-image"
      />

      <h1 class="onboarding__title" data-testid="onboarding-title">
        {{ $t(step.title) }}
      </h1>
      <p class="onboarding__text" data-testid="onboarding-text">
        {{ $t(step.text) }}
      </p>
    </section>

    <div class="onboarding__dots" data-testid="onboarding-dots">
      <span
        v-for="(step, index) in steps"
        :key="step.title"
        class="onboarding__dot"
        :class="{ 'is-active': index === currentStep }"
        data-testid="onboarding-dot"
      />
    </div>

    <button
      type="button"
      class="button button--primary onboarding__button"
      data-testid="onboarding-continue"
      @click="next"
    >
      {{ currentStep === 0 ? $t('onboarding.continue') : $t('onboarding.start') }}
    </button>
  </main>
</template>
