// apps/Designer/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ssr: false,
  nitro: {
    preset: 'static',
    serveStatic: true
  },

  router: {
    options: {
      hashMode: false
    }
  },

  app: {
    baseURL: './',
    buildAssetsDir: '_nuxt/',
    cdnURL: ''
  },

  // Явная настройка путей сборки
  vite: {
    base: './',
    build: {
      assetsDir: '_nuxt',
      rollupOptions: {
        output: {
          assetFileNames: '_nuxt/[name]-[hash][extname]',
          chunkFileNames: '_nuxt/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js'
        }
      }
    }
  }
})
