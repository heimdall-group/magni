<script setup lang="ts">

  const props = defineProps({
    block: {
      type: Object as PropType<Block>,
      required: true,
    },
  });
</script>

<template>
  <div>
    <slot></slot>
    <blocks-types-editor
      v-model="block.properties.content"
    />
  </div>
</template>
