<script setup lang="ts">
  const content = ref<HTMLDivElement>()
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
    <div
      ref="content"
      :contenteditable="!props.readonly"
      spellcheck="false"
      translate="no"
      @input="block.properties.content = content?.innerText || ''"
    >
      {{ props.block.properties.content }}
    </div>
  </div>
</template>
