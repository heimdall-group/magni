<script setup lang="ts">
  import { PropType, ref, type VueElement } from 'vue';
  const content = ref<InstanceType<typeof VueElement>[]>([])
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
  });
  const emits = defineEmits(['keydown'])
</script>

<template>
  <div class="block-columns">
    <blocks-types-columns
      v-for="(column, index) in block.properties.columns"
      v-model="column.content"
      @keydown="emits('keydown', $event, content[index])"
      :data-type="block.type"
      ref="content"
      :data-row="index"
      :readonly="readonly"
    />
  </div>
</template>
