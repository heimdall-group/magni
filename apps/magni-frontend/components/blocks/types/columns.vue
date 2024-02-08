<script setup lang="ts">
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
    <blocks-types-editor
      v-model="content"
      :readonly="readonly"
    />
  </div>
</template>