<script setup lang="ts">
  import { ref } from 'vue';
  import type { Block } from 'irpa-types';

  const newpage = ref<Block>({
    type: 'page',
    properties: {
        content: 'Title',
    },
    content: [
      {
        id: 'heading_1',
        type: 'heading_1',
        properties: {content: 'Test'},
        content: [],
        parents: {
          'page_id_1': 'page_id_1'
        },
      },
      {
        id: 'paragraph_id_4',
        type: 'paragraph',
        properties: {content: 'test Gaming *test* test'},
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
</template>
