// apps/Designer/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // Ключевые настройки для SPA в Electron
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
    baseURL: './',  // Критически важно
    buildAssetsDir: '_nuxt/',  // Без начального слеша!
    cdnURL: ''  // Явно отключаем CDN
  },

  // Явная настройка путей сборки
  vite: {
    base: './',  // Базовый путь для Vite
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
