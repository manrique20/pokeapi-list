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
<style lang="scss">
@use '~/assets/scss/pages/_splash.scss' as *;
@use '~/assets/scss/components/_pokeball-loader.scss' as *;

</style>