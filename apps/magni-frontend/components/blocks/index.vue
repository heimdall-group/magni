<script setup lang="ts">
  import type { VueElement } from 'vue';
  import { VueDraggable } from 'vue-draggable-plus'

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
    'path': {
      type: Array,
      required: true,
    },
  });
  const emits = defineEmits([
    'drag:active',
    'block:resolve',
    'block:insert',
    'block:remove',
    'block:move:prev',
    'block:move:next',
    'block:position:up',
    'block:position:down',
  ])
  onMounted(() => {
    emits('block:resolve', props.block, props.parent, [...props.path, props.block.id])
  })

  const content = ref<InstanceType<typeof VueElement> | null>(null);
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
          emits('block:insert', props.block, block, 'paragraph', props.parent)
        } 
        break;
      case 'Backspace':
        // If text hasnt been highlighted and pointer position is at start we remove the current block. If text remains it will be merged into "above" block
        if (!highlightedBlock() && blockAtFirstChar(block)) {
          event.preventDefault();
          event.stopPropagation();
          emits('block:remove', props.block, block)
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
          emits('block:position:up', props.block, block)
        // If at first line move to previous block
        } else if (blockAtFirstLine(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:prev', props.block, block, 'ArrowUp')
        }
        break;
      case 'ArrowRight':
        // If at end of last line emit block:move:next
        if (blockAtLastChar(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:next', props.block, block, 'ArrowRight')
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
          emits('block:position:down', props.block, block)
        // If at last line move to next block
        } else if (blockAtLastLine(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:next', props.block, block, 'ArrowDown')
        }
        break;
      case 'ArrowLeft':
        // If at start of first line emit block:move:prev
        if (blockAtFirstChar(block)) {
          event.stopPropagation();
          event.preventDefault();
          emits('block:move:prev', props.block, block, 'ArrowLeft')
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
    :id="`block-${block.id}`"
    :class="[
      {
        'has-children': block.content.length > 0
      },
      `block-type-${block.type.replace('_', '-')}`,
    ]"
  >
    <div class="block-container">
      <div class="block-controls">
        <v-btn class="block-handle">
          <font-awesome-icon icon="fa-solid fa-grip-vertical" />
        </v-btn>
      </div>
      <div class="block-content">
        <component
          @keydown="keyDownHandler"
          @keyup="(event: KeyboardEvent) => blockRenderMarkdown(event, block, menus)"
          :is="`blocks-types-${block.type.replace('_', '-')}`"
          :readonly="readonly"
          :data-type="block.type"
          :child="child"
          :block="block"
          ref="content"
        />
      </div>
    </div>
    <vue-draggable
      v-model="block.content"
      handle=".block-handle"
      group="blocks"
      class="block-children"
      :class="{
        'block-children--empty': block.content.length === 0,
      }"
      chosenClass="block--dragging"
      @start="$emit('drag:active', true)"
      @end="$emit('drag:active', false)"
    >
      <blocks
        v-for="(subblock, index) in block.content"
        :key="`block-${subblock.id}`"
        :class="contentBlocks.includes(subblock.type) ? 'content-block' : 'navigation-block'"
        :page="page"
        :block="subblock"
        :readonly="readonly"
        :parent="block.id"
        :path="[...path, block.id]"
        child
        @block:resolve="(...args) => $emit('block:resolve', ...args)"
        @drag:active="(value: boolean) => $emit('drag:active', value)"
        @block:remove="(...args) => $emit('block:remove', ...args)"
        @block:insert="(...args) => $emit('block:insert', ...args)"
        @block:position:up="(...args) => $emit('block:position:up', ...args)"
        @block:position:down="(...args) => $emit('block:position:down', ...args)"
        @block:move:prev="(...args) => $emit('block:move:prev', ...args)"
        @block:move:next="(...args) => $emit('block:move:next', ...args)"
      />
    </vue-draggable>
  </div>
</template>
