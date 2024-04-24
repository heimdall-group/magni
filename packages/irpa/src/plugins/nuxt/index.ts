// import { defineNuxtModule, createResolver, addComponent, addPlugin, addPluginTemplate } from '@nuxt/kit'


// export default defineNuxtModule({
//   setup (options, nuxt) {
//     const resolver = createResolver(import.meta.url);
//     if (Object.keys(options).length === 0) {
//       options = {
//         tags: {
//           blockButtonHandle: 'button',
//         }
//       }
//     }

//     nuxt.hook('app:mounted', (app) => {
//       console.log('app created')
//       app.config.globalProperties.$irpa = {
//         tags: options.tags
//       }
//     })

//     addComponent({
//       name: 'blocks',
//       filePath: resolver.resolve('../../components/blocks/index.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-editor',
//       filePath: resolver.resolve('../../components/blocks/editor.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-selection',
//       filePath: resolver.resolve('../../components/blocks/selection.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-bulleted-list',
//       filePath: resolver.resolve('../../components/blocks/types/bulleted-list.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-code',
//       filePath: resolver.resolve('../../components/blocks/types/code.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-columns',
//       filePath: resolver.resolve('../../components/blocks/types/columns.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-columns-2',
//       filePath: resolver.resolve('../../components/blocks/types/columns-2.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-columns-3',
//       filePath: resolver.resolve('../../components/blocks/types/columns-3.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-columns-4',
//       filePath: resolver.resolve('../../components/blocks/types/columns-4.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-columns-5',
//       filePath: resolver.resolve('../../components/blocks/types/columns-5.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-heading',
//       filePath: resolver.resolve('../../components/blocks/types/heading.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-heading-1',
//       filePath: resolver.resolve('../../components/blocks/types/heading-1.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-heading-2',
//       filePath: resolver.resolve('../../components/blocks/types/heading-2.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-heading-3',
//       filePath: resolver.resolve('../../components/blocks/types/heading-3.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-page',
//       filePath: resolver.resolve('../../components/blocks/types/page.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-paragraph',
//       filePath: resolver.resolve('../../components/blocks/types/paragraph.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-quote',
//       filePath: resolver.resolve('../../components/blocks/types/quote.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-table',
//       filePath: resolver.resolve('../../components/blocks/types/table.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-to-do',
//       filePath: resolver.resolve('../../components/blocks/types/to-do.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-toggle-heading-1',
//       filePath: resolver.resolve('../../components/blocks/types/toggle-heading-1.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-toggle-heading-2',
//       filePath: resolver.resolve('../../components/blocks/types/toggle-heading-2.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-toggle-heading-3',
//       filePath: resolver.resolve('../../components/blocks/types/toggle-heading-3.vue'),
//       global: true,
//     });
//     addComponent({
//       name: 'blocks-types-toggle-list',
//       filePath: resolver.resolve('../../components/blocks/types/toggle-list.vue'),
//       global: true,
//     });
//   }
// })