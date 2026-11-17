export default defineNuxtConfig({
  compatibilityDate: '2026-11-18',
  devtools: { enabled: true },
  typescript: {
    strict: true
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
        { name: 'theme-color', content: '#f5eee3' }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  }
})
