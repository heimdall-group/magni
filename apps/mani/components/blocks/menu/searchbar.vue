<script setup lang="ts">
import type { VueElement } from 'vue';

  const props = defineProps({
    'modelValue': {
      type: Boolean,
      default: false,
    },
    'block': {
      type: Object as unknown as Block,
      required: true,
    }
  });
  const emits = defineEmits(['update:modelValue', 'update:block'])
  const search = ref('');
  const active = ref(0);
  interface SelectorListInstance extends InstanceType<typeof VueElement> {
    types: string[];
    list: string[];
  }

  const selectorList = ref<SelectorListInstance | null>(null);
  const show = ref(props.modelValue);
  const cords = ref({x: 0, y: 0});
  watch(() => props.modelValue, (value) => {
    if (value) {
      cords.value = blockGetCaretCoordinates() || {x: 0, y: 0};
      show.value = true;
    } else {
      cords.value = {x: 0, y: 0};
      show.value = false;
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
        emits('update:block', selectorList.value?.list[active.value], search.value);
        itemSelectedHandler();
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

    setTimeout(() => {
      search.value = /\/([^ ]*)(?=[\s])?/g.exec(props.block.properties.content || '')?.[1] || '';
    }, 0)
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
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', keyDownHandler, false)
    document.removeEventListener('click', outsideClickHandler, false)
  })
</script>

<template>
  <v-scale-transition leave-absolute >
    <v-sheet
      v-show="show"
      class="overflow-y-auto block-searchbar-menu"
      role="dialog"
      elevation="12"
      height="450"
      width="275px"
      :style="{left: `${cords.x}px`, top: `${cords.y}px`}"
    >
      <blocks-menu-selector-list ref="selectorList" :search="search" v-model:active="active" @click="clickHandler" />
    </v-sheet>
  </v-scale-transition>
</template>
