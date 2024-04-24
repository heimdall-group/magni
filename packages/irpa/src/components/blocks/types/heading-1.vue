<script setup lang="ts">
  import { PropType, ref, type VueElement } from 'vue';
  import type { Block } from 'irpa-types';
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
      default: 'h2',
    },
  });
</script>

<template>
  <blocks-types-heading :block="block" :readonly="readonly" ref="content" :tag="tag" />
</template>
