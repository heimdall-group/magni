<script setup lang="ts">
  import { PropType, ref, type VueElement } from 'vue';
  import Heading_1 from './heading-1.vue';
  import type { Block } from 'irpa-types';
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
    child: {
      type: Boolean,
      default: false,
    },
  });
</script>

<template>
  <Heading_1 v-if="!child" :block="block" :readonly="readonly" tag="h1" ref="content"></Heading_1>
  <div
    v-else
  >
    <NuxtLink :to="`/${block.id}`">
      <font-awesome-icon icon="fa-regular fa-file" size="xl" />
      <span>{{ block.properties.content }}</span>
    </NuxtLink>
  </div>
</template>
