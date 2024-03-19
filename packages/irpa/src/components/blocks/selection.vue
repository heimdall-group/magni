<script setup lang="ts">
  const props = defineProps({
    top: {
      type: [Number, Boolean, String],
      required: true,
    },
    left: {
      type: [Number, Boolean, String],
      required: true,
    },
    right: {
      type: [Number, Boolean, String],
      required: true,
    },
    bottom: {
      type: [Number, Boolean, String],
      required: true,
    },
    height: {
      type: [Number, Boolean, String],
      required: true,
    },
    width: {
      type: [Number, Boolean, String],
      required: true,
    },
  })
</script>

<template>
  <div
    class="block-page-selection"
    :style="{
      top: typeof top === 'number' ? `${top}px` : 'unset',
      right: typeof right === 'number' ? `${right}px` : 'unset',
      bottom: typeof bottom === 'number' ? `${bottom}px` : 'unset',
      left: typeof left === 'number' ? `${left}px` : 'unset',
      height: `${height}px`,
      width: `${width}px`,
    }"
  >
  </div>
</template>
