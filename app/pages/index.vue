<script setup lang="ts">
const isFirstTime = useFirstTime()

onMounted(() => {
  setTimeout(() => {
    navigateTo(isFirstTime.value ? '/onboarding' : '/pokedex', { replace: true })
  }, SPLASH_DURATION_MS)
})
</script>

<template>
  <main class="splash" data-testid="splash">
    <h1 class="splash__title">{{ $t('app.name') }}</h1>
    <PokeballLoader data-testid="splash-loader" />
    <p class="splash__text">{{ $t('splash.loading') }}</p>
  </main>
</template>
