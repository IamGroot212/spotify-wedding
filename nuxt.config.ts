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
      meta: [
        { content: 'width=device-width, initial-scale=1, maximum-scale=1', name: 'viewport' },
      ],
      title: 'Spotify Wedding',
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
