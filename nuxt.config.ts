export default defineNuxtConfig({
  compatibilityDate: '2025-05-07',

  devtools: { enabled: true },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  vite: {
    plugins: [],
  },
});
