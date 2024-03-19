<script setup lang="ts">
  import BlockEditor from './components/block-editor.vue';
  import { ref } from 'vue';
  import type { Block } from './types/blocks.d.ts';

  const newpage = ref<Block>({
    type: 'page',
    properties: {
        content: 'Title',
    },
    content: [],
    parents: {},
    id: 'page_id_1',
  });

  const test = ref('*test* utanför');
  const test2 = ref('Jag blir sur om detta inte fungerar');
  const test3 = ref('*t*');
  const handleClick = () => {
    test.value = 'updated';
  }
</script>

<template>
  <!-- <blocks-editor :page="newpage" /> -->
  <block-editor html :readonly="false" v-model="test" />
  <block-editor :readonly="false" v-model="test2" />
  <block-editor html :readonly="false" v-model="test3" />
</template>
