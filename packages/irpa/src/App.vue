<script setup lang="ts">
  import BlocksEditor from './components/blocks/editor.vue';
  import BlockComponentNewEditor from './components/blocks/components/new-editor.vue';
  import { ref } from 'vue';
  import type { Block } from './types/blocks.d.ts';

  const newpage = ref<Block>({
    type: 'page',
    properties: {
        content: 'Title',
    },
    content: [
      // {
      //   id: 'page_id_2',
      //   type: 'page',
      //   properties: {content: 'New Page'},
      //   content: [],
      //   parents: {
      //     'page_id_1': 'page_id_1'
      //   },
      // },
      // {
      //   id: 'heading_id_1',
      //   type: 'heading_1',
      //   properties: {content: 'Heading 1'},
      //   content: [],
      //   parents: {
      //     'page_id_1': 'page_id_1'
      //   },
      // },
      // {
      //   id: 'heading_id_2',
      //   type: 'heading_2',
      //   properties: {content: 'Heading 2'},
      //   content: [],
      //   parents: {
      //     'page_id_1': 'page_id_1'
      //   },
      // },
      // {
      //   id: 'heading_id_3',
      //   type: 'heading_3',
      //   properties: {content: 'Heading 3'},
      //   content: [],
      //   parents: {
      //     'page_id_1': 'page_id_1'
      //   },
      // },
      {
        id: 'paragraph_id_4',
        type: 'paragraph',
        properties: {content: 'test Gaming <em>test</em> test'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
    ],
    parents: {},
    id: 'page_id_1',
  });

  const test = ref('test');
  const handleClick = () => {
    test.value = 'updated';
  }
</script>

<template>
  <blocks-editor :page="newpage" />
  <!-- <block-component-new-editor html :readonly="false" v-model="test" /> -->
  <button
    @click="handleClick"
  >
    Update
  </button>
</template>
