import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-15',
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: false },

  components: [{ path: '~/components', pathPrefix: false }],

  modules: ['@pinia/nuxt', '@nuxt/icon', '@nuxtjs/i18n'],

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: [
            `@use "${fileURLToPath(new URL('./app/assets/scss/_variables.scss', import.meta.url)).replaceAll('\\', '/')}" as *;`,
            `@use "${fileURLToPath(new URL('./app/assets/scss/_mixins.scss', import.meta.url)).replaceAll('\\', '/')}" as *;`,
            '',
          ].join('\n'),
        },
      },
    },
  },

  i18n: {
    restructureDir: 'app',
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    langDir: 'locales',
    strategy: 'no_prefix',
  },
})
