import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-07',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', '@nuxt/eslint'],

  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },

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
    plugins: [tailwindcss()],
  },
});
