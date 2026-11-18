module.exports = {
  apps: [
    {
      name: 'golden-hour',
      script: '.output/server/index.mjs',
      instances: 1,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3010,
        NUXT_APP_BASE_URL: '/golden-hour/'
      }
    }
  ]
}
