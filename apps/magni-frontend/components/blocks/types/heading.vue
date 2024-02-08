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
    tag: {
      type: String,
      required: false
    },
  });

  const component = props.tag || `h${props.block.type.split('_')[1]}`
</script>

<template>
  <div>
    <component
      ref="content"
      :is="component"
      :contenteditable="!props.readonly"
      spellcheck="false"
      translate="no"
      @input="block.properties.content = content?.innerText || ''"
    >
      {{ props.block.properties.content }}
    </component>
  </div>
</template>
