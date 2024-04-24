<script setup lang="ts">
  import { PropType } from 'vue';
  import type { Block } from 'irpa-types';
  const props = defineProps({
    block: {
      type: Object as PropType<Block>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    undoManager: {
      type: Object,
      required: true,
    }
  });
</script>

<template>
  <div>
    <blocks-components-editor
      v-model="block.properties.content"
      :readonly="readonly"
      :undo-manager="undoManager"
      html
      overwrite-caret-position
    />
  </div>
</template>
