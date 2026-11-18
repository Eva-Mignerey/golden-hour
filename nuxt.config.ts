export default defineNuxtConfig({
  compatibilityDate: '2026-11-18',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],
  typescript: {
    strict: true
  },
  routeRules: {
    '/recherche': { prerender: false },
    '/position': { prerender: false },
    '/lieu/**': { prerender: false }
  },
  runtimeConfig: {
    public: {
      geocodingUrl: 'https://geocoding-api.open-meteo.com/v1',
      forecastUrl: 'https://api.open-meteo.com/v1/forecast'
    }
  },
  css: [
    '@fontsource-variable/fraunces/full.css',
    '@fontsource-variable/fraunces/full-italic.css',
    '@fontsource/archivo/400.css',
    '@fontsource/archivo/500.css',
    '~/assets/scss/main.scss'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Golden Hour',
      titleTemplate: '%s · Golden Hour',
      meta: [
        { name: 'description', content: 'La météo des photographes : heures dorées, heures bleues et qualité de la lumière, lieu par lieu.' },
        { name: 'theme-color', content: '#f5eee3' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Golden Hour — la météo des photographes',
      short_name: 'Golden Hour',
      description: 'Heures dorées, heures bleues et qualité de la lumière, lieu par lieu.',
      lang: 'fr',
      theme_color: '#f5eee3',
      background_color: '#f5eee3',
      display: 'standalone',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    generateSW: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,woff2,svg,png}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.hostname.endsWith('open-meteo.com'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'open-meteo',
            networkTimeoutSeconds: 6,
            expiration: { maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 4,
            expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
            cacheableResponse: { statuses: [200] }
          }
        }
      ]
    },
    client: {
      installPrompt: false
    },
    devOptions: {
      enabled: false
    }
  }
})
