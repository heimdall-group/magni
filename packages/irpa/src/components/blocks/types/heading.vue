<script setup lang="ts">
import { PropType } from 'vue';

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
      required: false
    },
    undoManager: {
      type: Object,
      required: true,
    }
  });
  const component = props.tag || `h${props.block.type.split('_')[1]}`
</script>

<template>
  <div>
    <blocks-components-editor
      v-model="block.properties.content"
      :tag="component"
      :readonly="readonly"
      :undo-manager="undoManager"
      singleline
      overwrite-caret-position
    />
  </div>
</template>
