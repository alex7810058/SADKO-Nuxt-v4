const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    ...(isDev ? [] : ['nuxt-electron'])
  ],
  ssr: false,

  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false
  },

  app: {
    baseURL: './',
    buildAssetsDir: '_nuxt/' // Стандартная папка Nuxt
  },

  router: {
    options: {
      hashMode: false
    }
  },

  nitro: {
    preset: 'static'
  }
})
