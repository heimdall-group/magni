<script setup lang="ts">
import type { PropType } from 'vue';
import type { VueElement } from 'vue';

  const props = defineProps({
    page: {
      type: Object as PropType<Block>,
      required: true
    }
  });

  const emits = defineEmits(['update:modelValue'])
  const readonly = ref(false);
  const dragging = ref(false);
  const editor = ref<InstanceType<typeof VueElement>>()
  const resolvedBlocks = ref<{[key: string]: ResolvedBlock}>({});
  const resolvedPaths = ref<{[key: string]: string[]}>({});

  const handleBlockRemove = () => {
    // Remove current block. Take content and pass to blocks -1
    // If its the last block just do nothing
  }

  const handleBlockInsert = () => {
    // If enter is pressed mid block split content into a new block
    // Just create a new block and grab all the content "left"

  }

  // look in current block. Unless more editors exist go to next block, next block could be child block
  const handleBlockPositionUp = (block: Block, ref: VueElement) => {
  }

  const handleBlockPositionDown = (block: Block, ref: VueElement) => {
  }

  const handleBlockMovePrev = (block: Block, ref: VueElement, key: 'ArrowLeft' | 'ArrowUp', el?: HTMLElement) => {
    const { editor, container } = blockGetEditor(ref)
    const domBlock = document.querySelector(`#block-${block.id}`);
    if (!domBlock) {
      return;
    }

    if (multiEdiorBlocks.includes(block.type)) {
      console.log('multiEdiorBlocks', block.type)
    } else {
      let content = container;
      // Get next sibling
      if (domBlock?.previousElementSibling) {
        const id = domBlock.previousElementSibling.getAttribute('id')?.replace('block-', '');
        if (!id) { 
          return;
        }
        // Get previus blocks last content
        const newBlock = blockResolvePath(resolvedPaths.value[id], props.page);
        if (newBlock.content.length > 0) {
          content = document.querySelector(`#block-${newBlock.content[newBlock.content.length - 1].id}`) || container;
        } else {
          content = domBlock.previousElementSibling as HTMLElement || container;
        }
      } else {
        const newBlock = blockResolvePath(resolvedPaths.value[block.parents[props.page.id]], props.page);
        content = document.querySelector(`#block-${newBlock.id}`) || container;
      }

      if (content.classList.contains('navigation-block')) {
        const id = content.getAttribute('id')?.replace('block-', '');
        if (!id) {
          return;
        }
        const newBlock = blockResolvePath(resolvedPaths.value[id], props.page);
        const newDom = document.querySelector(`#block-${newBlock.id}`);
        handleBlockMovePrev(newBlock, newDom as VueElement, key, domBlock as HTMLElement)
        return;
      }

      if (domBlock.querySelector(`#block-${block.id} > div.block-container`)?.contains(blockGetEditor(content as VueElement).container)) {
        return
      }
      blockSetCaretPos(content as VueElement, key === 'ArrowLeft' ? 'end' : 'current', el || domBlock  as HTMLElement)
    }
  }

  const handleBlockMoveNext = (block: Block, ref: VueElement, key: 'ArrowRight' | 'ArrowDown', el?: HTMLElement) => {
    const { editor, container } = blockGetEditor(ref)
    const domBlock = document.querySelector(`#block-${block.id}`);
    if (!domBlock) {
      return;
    }

    if (multiEdiorBlocks.includes(block.type)) {
      console.log('multiEdiorBlocks', block.type)
    } else {
      // Get next content block or next sibling block
      let content = container;
      if (block.content.length > 0) {
        const nextBlock = block.content[0]
        content = document.querySelector(`#block-${nextBlock.id}`) || container;
      }

      // Get next sibling
      else if (domBlock?.nextElementSibling) {
        content = domBlock.nextElementSibling as HTMLElement || container
      } else {
        content = (function(){
          let recurrsion = true;
          let _block = blockResolvePath(resolvedPaths.value[block.id], props.page);
          let itterations = 0;
          while (recurrsion) {
            const parent =  document.querySelector(`#block-${_block.parents[props.page.id]}`);
            if (parent?.nextElementSibling) {
              return parent.nextElementSibling as HTMLElement
            } else {
              const newBlock = blockResolvePath(resolvedPaths.value[_block.parents[props.page.id]], props.page);
              if (itterations === Object.keys(resolvedPaths.value).length) {
                recurrsion = false;
              }
              _block = newBlock;
            }
            itterations++;
          }
        }()) || container;
      }
      if (content.classList.contains('navigation-block')) {
        const id = content.getAttribute('id')?.replace('block-', '');
        if (!id) {
          return;
        }
        const newBlock = blockResolvePath(resolvedPaths.value[id], props.page);
        handleBlockMoveNext(newBlock, content as VueElement, key, domBlock as HTMLElement)
        return;
      }
      if (domBlock.querySelector(`#block-${block.id} > div.block-container`)?.contains(content)) {
        return
      }
      
      blockSetCaretPos(content as VueElement, key === 'ArrowRight' ? 'start' : 'current', el || domBlock  as HTMLElement)
    }
  }

  const handleBlockResolve = (block: Block, parent: string, path: string[]) => {
    const obj: ResolvedBlock = {} as ResolvedBlock
    const arr: string[] = [];
    block.content.forEach((block) => {
      arr.push(block.id)
    });
    block.parents[props.page.id] = parent;
    Object.assign(obj, block, {content: arr})
    resolvedBlocks.value[block.id] = obj

    resolvedPaths.value[block.id] = path;
  }

  const handleEditorMouseUp = (event: MouseEvent) => {
    // Get block of closest element to mouseup event
    const rects: DOMRect[] = [];
  }
</script>

<template>
  <v-row>
    <v-col>
      <v-btn
        @click="readonly = !readonly"
      >
        Readonly: {{ readonly }}
      </v-btn>
    </v-col>
  </v-row>
  <div
    class="block-page py-16"
    :class="{
      'block-page--readonly': readonly,
      'block-page--dragging': dragging,
    }"
    ref="editor"
    @mouseup="handleEditorMouseUp"
  >
  <ClientOnly>
    <blocks
      :page="page.id"
      :block="page"
      :readonly="readonly"
      :parent="page.id"
      :path="[]"
      class="block-page-title"
      ref="editor"
      @drag:active="(value: boolean) => dragging = value"
      @block:resolve="handleBlockResolve"
      @block:remove="handleBlockRemove"
      @block:insert="handleBlockInsert"
      @block:position:up="handleBlockPositionUp"
      @block:position:down="handleBlockPositionDown"
      @block:move:prev="handleBlockMovePrev"
      @block:move:next="handleBlockMoveNext"
    />
  </ClientOnly>
  </div>
</template>
