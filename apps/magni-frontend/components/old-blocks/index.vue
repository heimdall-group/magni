<script setup lang="ts">
  import type { VueElement } from 'vue';

  const props = defineProps({
    'block': {
      type: Object as PropType<Block>,
      required: true,
    },
    'readonly': {
      type: Boolean,
      default: false,
    },
    'parent': {
      type: String,
      required: true,
    },
    'page': {
      type: String,
      required: true,
    },
    'child': {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits([
    'block:insert',
    'block:remove',
    'block:move:prev',
    'block:move:next',
    'block:position:up',
    'block:position:down',
  ])

  const content = ref<InstanceType<typeof VueElement> | null>(null);
  const editor = ref<InstanceType<typeof VueElement> | null>(null);
  const menus = ref<BlockMenu>({
    searchbar: false,
    navigation: false,
  });

  const keyDownHandler = (event:KeyboardEvent, ref?: InstanceType<typeof VueElement>) => {
    const block = ref ? ref : content.value;
    if (!block) {
      return;
    }
    switch(event.key) {
      case 'Enter':
        // If shift is used we just want to create a new line in current block
        if (menus.value.searchbar) {
          event.preventDefault();
        } else if (!event.shiftKey) {
          event.preventDefault();
          emits('block:insert', block, 'paragraph', props.parent)
        } 
        break;
      case 'Backspace':
        // If text hasnt been highlighted and pointer position is at start we remove the current block. If text remains it will be merged into "above" block
        if (!highlightedBlock() && blockCursorPosition(event.target as HTMLElement, 'start')) {
          event.preventDefault();
          event.stopPropagation();
          emits('block:remove', block)
        }
        break;
      case 'ArrowUp':
        if (menus.value.searchbar) {
          break;
        }
        // Alt + Arrowup should move block up
        if (event.altKey) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:position:up', block)
        // If at first line move to previous block
        } else if (blockAtFirstLine(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:prev', block, 'ArrowUp')
        }
        break;
      case 'ArrowRight':
        // If at end of last line emit block:move:next
        if (blockAtLastChar(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:next', block, 'ArrowRight')
        }
        break;
      case 'ArrowDown':
        // Alt + Arrowdown should move block down
        if (menus.value.searchbar) {
          break;
        }
        if (event.altKey) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:position:down', block)
        // If at last line move to next block
        } else if (blockAtLastLine(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:next', block, 'ArrowDown')
        }
        break;
      case 'ArrowLeft':
        // If at start of first line emit block:move:prev
        if (blockAtFirstChar(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:prev', block, 'ArrowLeft')
        }
        break;
    }
  }

  const searchHandler = (type: Block["type"], search: string) => {
    props.block.properties.content = props.block.properties.content.replace(`/${search}`, '');
    if (props.block.properties.content.length !== 0) {
      emits('block:insert', props.block, type)
    } else {
      props.block.type = type;
      // component.value = defineAsyncComponent(() => import(`~/components/blocks/types/${props.block.type}.vue`));
    }
  }

  // Defines Expose so that :ref="" can access information from component
  defineExpose({
    content,
  })
</script>

<template>
  <div 
    class="block"
    :id="block.id"
    :class="[
      {'has-children': block.content.length > 0},
      `block-${block.type}`,
      contentBlocks.includes(block.type) ? 'content-block' : 'navigation-block',
    ]"
  >
    <div class="block-controls">
      <v-btn class="block-insert" @click="(event: MouseEvent) => emits('block:insert', content, 'paragraph', parent, event)">
        <font-awesome-icon icon="fa-solid fa-plus" />
      </v-btn>
      <v-btn class="block-handle">
        <font-awesome-icon icon="fa-solid fa-grip-vertical" />
      </v-btn>
    </div>
    <div class="block-content">
      <blocks-menu-searchbar ref="searchbar" v-model="menus.searchbar" :block="block" @update:block="searchHandler" />
      <component
        @keydown="keyDownHandler"
        @keyup="(event: KeyboardEvent) => blockRenderMarkdown(event, block, menus)"
        :is="`blocks-types-${block.type.replace('_', '-')}`"
        :readonly="readonly"
        :data-type="block.type"
        :block="block"
        ref="content"
      />
      <!-- <component
        @keydown="(event: KeyboardEvent, ref: VueElement) => blockKeyDownHandler(event, menus, parent, $emit, content, ref)"
        @keyup="(event: KeyboardEvent) => blockRenderMarkdown(event, block, menus)"
        :is="`blocks-types-${block.type.replace('_', '-')}`"
        :readonly="readonly"
        :data-type="block.type"
        :block="block"
        ref="content"
      /> -->
    </div>
    <div v-if="block.content.length > 0" class="block-children">
      <blocks 
        v-for="(subBlock, index) in block.content"
        :key="`block-${index}`"
        :parent="block.id"
        :block="subBlock"
        :page="page"
        :readonly="readonly"
        child 
      />
    </div>
  </div>
</template>
