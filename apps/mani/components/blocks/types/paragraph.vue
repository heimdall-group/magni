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
  });

  defineExpose({
    content,
  })
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
