// https://nuxt.com/docs/api/configuration/nuxt-config

import { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  components: {
    dirs: [
      {
        path: '~/components/blocks/types',
        prefix: 'blocks-types',
        global: true,
      },
      '~/components',
    ]
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  devtools: { enabled: true },
  modules: [],
  nitro: {},
  runtimeConfig: {
    public: {
      ENVIRONMENT: process.env.ENVIRONMENT,
      PRODUCTION: process.env.NODE_ENV,
      FIREBASE_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_PROJECT: process.env.FIREBASE_PROJECT_ID,
      SESSION_ID_COOKIE_NAME: process.env.SESSION_ID_COOKIE_NAME,
      BASE_URL: process.env.BASE_URL,
      API_URL:  process.env.API_BASE_URL,
    },
    PRODUCTION_MONGO_URL: process.env.PRODUCTION_MONGO_URL,
  },
  typescript: {
    strict: true
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      cors: false
    }
  },
});
