<script setup lang="ts">
  import type { VueElement } from 'vue';
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
    tag: {
      type: String,
      default: 'h3',
    },
  });

  defineExpose({
    content,
  })
</script>

<template>
  <blocks-types-heading :block="block" :readonly="readonly" ref="content" :tag="tag" />
</template>
