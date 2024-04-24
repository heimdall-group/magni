<script setup lang="ts">
  import { Block } from 'irpa-types';
  import type { PropType } from 'vue';
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { blockGetCaretCoordinates, textBlocks, contentBlocks } from 'irpa-utils';
  const props = defineProps({
    'modelValue': {
      type: Boolean,
      default: false,
    },
    'block': {
      type: Object as PropType<Block>,
      required: true,
    }
  });
  const emits = defineEmits(['update:modelValue', 'update:block'])
  const search = ref('');
  const active = ref(0);
  const types = ref([...textBlocks, ...contentBlocks]);
  const modelValue = ref(props.modelValue);
  const coords = ref({x: 0, y: 0});
  const outOfBounds = ref(true);
  watch(() => props.modelValue, (value) => {
    if (value) {
      coords.value = blockGetCaretCoordinates() || {x: 0, y: 0};
      modelValue.value = true;
    } else {
      coords.value = {x: 0, y: 0};
      modelValue.value = false;
    }
  });

  const itemSelectedHandler = () => {
    emits('update:modelValue', false);
    search.value = '';
    active.value = 0;
  }

  const keyDownHandler = (event: KeyboardEvent) => {
    if (props.modelValue === undefined || !props.modelValue || ['Shift', 'Alt'].includes(event.key)) {
      return
    }
    switch(event.key) {
      case 'Enter':
        // If shift is used we just want to create a new line in current block
        event.preventDefault();
        // Return current selected type
        return;
        break;
      case 'ArrowUp':
        event.preventDefault();
        active.value = active.value === 0 ? 0 : active.value - 1;
        return;
        break;
      case 'ArrowDown':
        event.preventDefault();
        active.value = active.value === (selectorList.value?.types?.length ?? 0) - 1 ? (selectorList.value?.types?.length ?? 0) - 1 : active.value + 1;
        return;
        break;
      case 'Escape':
        event.preventDefault();
        emits('update:modelValue', false);
        return;
        break;
    }
    nextTick(() => {
      search.value = /\/([^ ]*)(?=[\s])?/g.exec(props.block.properties.content || '')?.[1] || '';
    })
  };
  const outsideClickHandler = () => {
    if (!props.modelValue) {
      return
    }
    emits('update:modelValue', false)
  }
  const clickHandler = (type: Block["type"]) => {
    emits('update:block', type, search.value);
    itemSelectedHandler();
  }
  
  onMounted(() => {
    document.addEventListener('keydown', keyDownHandler, false)
    document.addEventListener('click', outsideClickHandler, false)
  });
  onUnmounted(() => {
    document.removeEventListener('keydown', keyDownHandler, false);
    document.removeEventListener('click', outsideClickHandler, false);
  });
</script>

<template>
  <div
    class="block-menu"
    v-show="modelValue"
    :style="{
      transform: (outOfBounds ? `translateY(32px)` : 'translateY(-464px)') + ' translateX(-16px)',
      left: `${coords.x}px`,
      top: `${coords.y}px`
    }"
  >
    <ul>
      <li
        v-for="(type, index) in types"
        :key="`block-menu-${block.id}-${type}`"
        :class="{
          'active': active === index
        }"
        @click="clickHandler(type)"
        @mouseover="active = index"
      >
        {{ type }}
      </li>
    </ul>
  </div>
</template>
