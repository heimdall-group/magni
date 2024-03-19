<script setup lang="ts">
  import { PropType } from 'vue';
  import type { Block } from '../../../types/blocks';
  const props = defineProps({
    block: {
      type: Object as PropType<Block>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
</script>

<template>
  <div>
    <blocks-components-editor
      :readonly="readonly"
      v-model="block.properties.content"
      html
    />
  </div>
</template>
