<script setup lang="ts">
import { computed } from 'vue';

  const props = defineProps({
    modelValue: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const emits= defineEmits([
    'update:modelValue',
  ])
  const content = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emits('update:modelValue', value)
    }
  });
</script>

<template>
  <div class="block-column">
    <blocks-components-editor
      v-model="content"
      :readonly="readonly"
    />
  </div>
</template>