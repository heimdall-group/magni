import { createIrpa } from "irpa/plugins/vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createIrpa({
    properties: {
      tags: {
        blockButtonHandle: 'v-btn',
      },
    }
  }))
})
