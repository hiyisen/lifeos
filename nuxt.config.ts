import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-07',

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', '@nuxt/eslint'],

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
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

  app: {
    head: {
      script: [
        {
          innerHTML: `(function(){var t=localStorage.getItem('lifeos-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);})();`,
          tagPriority: 'critical',
        },
      ],
    },
  },
});
