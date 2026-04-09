// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/fonts',
  ],

  css: ['~/assets/css/main.css'],

  eslint: {
    config: {
      standalone: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [
        { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
        { color: '#e8c97e', href: '/favicon.svg', rel: 'mask-icon' },
      ],
      meta: [
        { content: 'width=device-width, initial-scale=1, maximum-scale=1', name: 'viewport' },
        { content: '#141312', name: 'theme-color' },
      ],
      title: 'The Midnight Concierge',
    },
  },

  runtimeConfig: {
    // Private (server-only)
    adminPassword: '',
    databasePath: '.data/db.sqlite',
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyRedirectUri: '',

    // Public (available on client)
    public: {
      baseUrl: '',
      pollingIntervals: {
        adminRefresh: 3000,
        nowPlaying: 5000,
        queue: 10000,
      },
    },
  },

  ssr: true,

  vite: {
    ssr: {
      noExternal: ['vue'],
    },
  },

  nitro: {
    preset: 'node-server',
  },
});
