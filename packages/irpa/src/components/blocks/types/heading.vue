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
  });
  const component = props.tag || `h${props.block.type.split('_')[1]}`
</script>

<template>
  <div>
    <blocks-components-editor
      :tag="component"
      :readonly="readonly"
      v-model="block.properties.content"
      singleline
    />
  </div>
</template>
