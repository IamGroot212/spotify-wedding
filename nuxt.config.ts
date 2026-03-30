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
      title: 'Spotify Wedding',
    },
  },

  runtimeConfig: {
    // Private (server-only)
    adminPassword: '',
    databasePath: '.data/db.sqlite',
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyRedirectUri: 'http://192.168.0.2:3002/api/auth/spotify/callback',

    // Public (available on client)
    public: {
      baseUrl: 'http://192.168.0.2:3002',
      pollingIntervals: {
        adminRefresh: 3000,
        nowPlaying: 5000,
        queue: 10000,
      },
    },
  },

  nitro: {
    preset: 'node-server',
  },
});
