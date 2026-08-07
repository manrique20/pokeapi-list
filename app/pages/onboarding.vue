<script setup lang="ts">
const isFirstTime = useFirstTime()
const { locale, locales, setLocale } = useI18n()

function completeOnboarding() {
  isFirstTime.value = false
  navigateTo('/pokedex')
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

    <span class="onboarding__badge" aria-hidden="true">
      <Icon name="i-material-symbols:celebration-rounded" size="44" />
    </span>

    <h1 class="onboarding__title">{{ $t('onboarding.title') }}</h1>
    <p class="onboarding__subtitle">{{ $t('onboarding.subtitle') }}</p>

    <div class="onboarding__actions">
      <button
        type="button"
        class="button button--primary"
        data-testid="onboarding-start"
        @click="completeOnboarding"
      >
        {{ $t('onboarding.start') }}
      </button>
      <button
        type="button"
        class="button button--ghost"
        data-testid="onboarding-skip"
        @click="completeOnboarding"
      >
        {{ $t('onboarding.skip') }}
      </button>
    </div>
  </main>
</template>
