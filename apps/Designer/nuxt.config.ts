export default defineNuxtConfig({
  modules: [
    '@nuxt/ui'
  ],
  css: ['@sadko/shared/css/nuxt-ui.main.css'],

  // Важно для Electron!
  ssr: false,

  // Dev сервер на порту 3001
  devServer: {
    port: 3001
  },

  app: {
    baseURL: process.env.NODE_ENV === 'production' ? './' : '/',
    buildAssetsDir: '/_nuxt/'
  },

  // Настройки для сборки
  nitro: {
    preset: 'node-server'
  }
})
