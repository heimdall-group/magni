<script setup lang="ts">
  import type { VueElement } from 'vue';
  import Heading_1 from './heading_1.vue';
  const content = ref<InstanceType<typeof VueElement>>()
  const props = defineProps({
    block: {
      type: Object as PropType<Block>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    child: {
      type: Boolean,
      default: false,
    },
  });

  defineExpose({
    content,
  })
</script>

<template>
  <Heading_1 v-if="!child" :block="block" :readonly="readonly" tag="h1" ref="content"></Heading_1>
  <div
    v-else
  >
    page link
  </div>
</template>
