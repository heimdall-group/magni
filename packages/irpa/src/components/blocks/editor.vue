<script setup lang="ts">
import type { PropType } from 'vue';
import type { VueElement } from 'vue';
import { ref, onMounted, unref } from 'vue';
import {
  blockExportAsMarkdown,
  blockGetAllContent,
  blockGetCaretPos,
  blockGetNewBlock,
  blockGetNextBlock,
  blockGetPrevBlock,
  blockInsertBlocks,
  blockNestBlocks,
  blockGetEditor,
  blockRemoveBlock,
  blockGetEndPos,
  blockGetCurrentPos,
  blockResolvePath,
  blockSetCaretPos,
  textBlocks,
} from 'irpa-utils';
import { IrpaUndoManager } from 'irpa-undo-manager';
import { Block, BlockCopy, BlockSelection, BlockEditorUndoManager } from 'irpa-types';
import { nextTick } from 'vue';

  const props = defineProps({
    page: {
      type: Object as PropType<Block>,
      required: true
    }
  });

  const emits = defineEmits(['update:modelValue'])
  const readOnly = ref(false);
  const dragging = ref(false);
  const undoManager = new IrpaUndoManager();
  const resolvedPaths = ref<{[key: string]: string[]}>({});

  const handleUndoManager = (action: BlockEditorUndoManager) => {
    switch(action.type) {
      case 'insert': {
        const { blocks, focus } = action;
      } break;
      case 'remove': {

      } break;
    }
  }

  const handleBlockRemove = (block: Block) => {
    const blockDom = document.querySelector(`#block-${block.id}`);
    const prevBlockDom = blockGetPrevBlock(block, resolvedPaths.value, props.page);
    const id = prevBlockDom?.getAttribute('id')?.replace('block-', '');
    if (id && prevBlockDom && blockDom) {
      const prevBlock = blockResolvePath(resolvedPaths.value[id], props.page);
      const parent = blockResolvePath(resolvedPaths.value[prevBlock.parents[props.page.id]], props.page);
      const { container } = blockGetEditor(blockDom);
      const pos = prevBlockDom.innerText.length;
      prevBlock.properties.content += container.innerText;
      blockRemoveBlock(parent, block);
      blockSetCaretPos(prevBlockDom, pos);
    }
  }

  const handleBlockInsert = (type: Block["type"], block: Block, ref: VueElement) => {
    let properties: Block["properties"] = {
      content: '',
    };
    if (textBlocks.includes(block.type)) {
      const pos = blockGetCaretPos(ref, 'html');
      const { content } = block.properties;
      properties.content = content.slice(pos);
      block.properties.content = content.slice(0, pos);
    } else {
      const pos = blockGetCaretPos(ref);
      const { content } = block.properties;
      properties.content = content.slice(pos);
      block.properties.content = content.slice(0, pos);
    }

    const newBlock = blockGetNewBlock(type, props.page.id, props.page.id);
    newBlock.properties = properties

    const parent = blockResolvePath(resolvedPaths.value[block.parents[props.page.id]], props.page);
    const index = parent.content.indexOf(block);
    blockInsertBlocks(newBlock, parent, index + 1);
    nextTick(() => {
      const domBlock = document.querySelector(`#block-${newBlock.id}`);
      if (domBlock) {
        blockSetCaretPos(domBlock, 0);
      }
    })
  }

  // look in current block. Unless more editors exist go to next block, next block could be child block
  const handleBlockPositionUp = (block: Block) => {
    console.log('position up', block)
  }

  const handleBlockPositionDown = (block: Block) => {
    console.log('position down', block)
  }

  const handleBlockMovePrev = (block: Block, key: 'ArrowLeft' | 'ArrowUp') => {
    const newBlock = blockGetPrevBlock(block, resolvedPaths.value, props.page);
    const currentBlock = document.querySelector(`#block-${block.id}`);
    if (newBlock && currentBlock) {
      const { container } = blockGetEditor(newBlock)
      const pos = blockGetCaretPos(currentBlock)
      blockSetCaretPos(newBlock, key === 'ArrowLeft' ? container.innerText.length : pos)
    }
  }

  const handleBlockMoveNext = (block: Block, key: 'ArrowRight' | 'ArrowDown') => {
    const newBlock = blockGetNextBlock(block, resolvedPaths.value, props.page);
    const currentBlock = document.querySelector(`#block-${block.id}`);
    if (newBlock && currentBlock) {
      blockSetCaretPos(newBlock, key === 'ArrowRight' ? 0 : blockGetCaretPos(currentBlock))
    }
  }

  const handleBlockResolve = (block: Block, path: string[]) => {
    resolvedPaths.value[block.id] = path;
    block.parents[props.page.id] = path[path.length - 2];
  }

  const handleEditorCopy = (event: ClipboardEvent) => {
    const targets: Block[] = [];
    if (selections.value.size > 0) {
      const blocks: Block[] = [];
      selections.value.forEach((id) => {
        const block = blockResolvePath(resolvedPaths.value[id as string], props.page);
        blocks.push(block);
      })

      const firstBlockRect = document.querySelector(`#block-${blocks[0].id}`)?.getBoundingClientRect();
      const lastBlockRect = document.querySelector(`#block-${blocks[blocks.length - 1].id}`)?.getBoundingClientRect();
      if (!firstBlockRect || !lastBlockRect) {
        return;
      }

      if (firstBlockRect.top > lastBlockRect.top) {
        blocks.reverse();
      }
      targets.push(...blocks);
    } else if (window.getSelection()?.toString().length === 0) {
      const block = document.activeElement?.closest('.block');
      const id = block?.getAttribute('id')?.replace('block-', '');
      if (id) {
        const block = blockResolvePath(resolvedPaths.value[id], props.page);
        targets.push(block);
      }
    }

    if (targets.length === 0) {
      return;
    }
    let data = '';
    targets.forEach((block) => {
      data += blockExportAsMarkdown(block) + '\n';
    })

    event.clipboardData?.setData('irpa-blocks', JSON.stringify({
      comparison: data,
      blocks: blockNestBlocks(targets, resolvedPaths.value, props.page.id)
    }));
    event.clipboardData?.setData('text/plain', data);
    event.preventDefault();
  }

  const handleEditorPaste = (event: ClipboardEvent) => {
    const blocks = event.clipboardData?.getData('irpa-blocks');
    const text = event.clipboardData?.getData('text/plain');
    const blockDom = (event.target as HTMLElement).classList.contains('.block') ? (event.target as HTMLElement) : (event.target as HTMLElement).closest('.block');
    const id = blockDom?.getAttribute('id')?.replace('block-', '');
    if (!blocks || !text || !blockDom || !id) {
      return
    }

    const block = blockResolvePath(resolvedPaths.value[id], props.page);
    const data = JSON.parse(blocks);
    if (data.comparison === text && (data.blocks && data.blocks.length && data.blocks.length > 0)) {
      event.preventDefault();
      // CHECK IF SYNC BLOCK, IF NOT CREATE NEW BLOCKS AND INSERT
      const blocks: Block[] = [];
      const parents: {[key: string]: string} = {};
      blockGetAllContent(data.blocks).forEach((block: BlockCopy) => {
        const newBlock = blockGetNewBlock(block.type, parents[block.parents[props.page.id]], props.page.id);
        newBlock.properties = block.properties;
        
        blocks.push(newBlock);
        parents[block.id] = newBlock.id;
        const path = resolvedPaths.value[block.id];
        for (const key in parents) {
          path[path.indexOf(key)] = parents[key];
        }
        handleBlockResolve(newBlock, path);
      });

      const parent = blockResolvePath(resolvedPaths.value[block.parents[props.page.id]], props.page);
      const index = parent.content.findIndex((block) => block.id === id);
      blockInsertBlocks(blockNestBlocks(blocks, resolvedPaths.value, props.page.id), parent, index)
    } else {
      event.clipboardData?.clearData('magni-blocks');
    }
  }

  const selections = ref<Set<unknown>>(new Set());
  const selector = ref<BlockSelection>({
    active: false,
    hasMoved: false,
    start: {
      top: 0,
      left: 0,
    },
    top: 0,
    right: false,
    bottom: false,
    left: 0,
    height: 0,
    width: 0,
  });
  let origin: DOMRect | undefined;
  let lastScroll = 0;

  // If event target isnt in block controlls
  const handleEditorMouseDown = (event: MouseEvent) => {
    const controls = (event.target as any).closest('.block-controls');
    const children = (event.target as any).closest('.block-children');
    if (
      !selector.value.active &&
      !(children && (children.contains(controls) || !children))
    ) {
      const editor = document.querySelector('.block-page');
      const rect = editor?.getBoundingClientRect();
      if(rect && editor) {
        selector.value.active = true;
        selector.value.start = {
          top: event.clientY - rect.top + editor.scrollTop,
          left: event.clientX - rect.left,
        }
        selector.value.top = selector.value.start.top;
        selector.value.left = event.clientX - rect.left;
      }
    }
  }

  const handleSelectorUpdate = (value: typeof selector.value) => {
    value.hasMoved = true;
    selector.value = value;
    const selectorRect = document.querySelector('.block-selector')?.getBoundingClientRect();
    if (!selectorRect) {
      return;
    }

    const blocks = document.querySelectorAll(`#block-${props.page.id} .block`);
    blocks.forEach((block) => {
      const rect = block.querySelector('.block-container .block-content')?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      if (!(
        rect.right < selectorRect.left || 
        rect.left > selectorRect.right || 
        rect.bottom < selectorRect.top || 
        rect.top > selectorRect.bottom
      )) {
        block.classList.add('block--selected');
        const id = block.getAttribute('id')?.replace('block-', '');
        if (id) {
          selections.value.add(id);
        }
      } else {
        block.classList.remove('block--selected');
        const id = block.getAttribute('id')?.replace('block-', '');
        if (id) {
          selections.value.delete(id);
        }
      }
    });
  }

  const handleEditorMouseMove = (event: MouseEvent) => {
    if (selector.value.active) {
      const editor = document.querySelector('.block-page');
      const rect = editor?.getBoundingClientRect();
      if (rect && editor) {
        let height = event.clientY - rect.top - selector.value.start.top + editor.scrollTop;
        let width = event.clientX - rect.left - selector.value.start.left;
        const obj = unref(selector);
        if (height < 0) {
          obj.bottom = rect.height - obj.start.top;
          obj.top = false;
          height = Math.abs(height);
        } else {
          obj.bottom = false;
          obj.top = obj.start.top;
        }
        if (width < 0) {
          obj.right = rect.width - obj.start.left;
          obj.left = false;
          width = Math.abs(width);
        } else {
          obj.right = false;
          obj.left = obj.start.left;
        }
        obj.height = height;
        obj.width = width;

        handleSelectorUpdate(obj);
      }
    }
  }

  const handleEditorMouseUp = (event: MouseEvent) => {
    if (!selector.value.hasMoved && !(event.ctrlKey || event.shiftKey)) {
      // If selection is more then 0 then remove all selections
      if (selections.value.size > 0) {
        selections.value.forEach((id) => {
          const block = document.querySelector(`#block-${id}`);
          if (block) {
            block.classList.remove('block--selected');
          }
        })
        selections.value.clear();
        origin = undefined;
      }
    }
    selector.value.active = false;
    selector.value.hasMoved = false;
    selector.value.height = 0;
    selector.value.width = 0;
    selector.value.top = 0;
    selector.value.right = false;
    selector.value.bottom = false;
    selector.value.left = 0;
  }

  const handleEditorDblMouseClick = (event: MouseEvent) => {
    // Get block of closest element to mouseup event
    interface Rects extends DOMRect {difference: number, type: 'title' | 'content'}
    const rects: Rects[] = [];
    [
      {
        id: props.page.id,
        type: 'title',
      },
      {
        id: props.page.content[props.page.content.length - 1].id,
        type: 'content',
      }
    ].forEach(({id, type}) => {
      const block = blockResolvePath(resolvedPaths.value[id], props.page);
      const node = document.querySelector(`#block-${block.id}`);
      if (node) {
        const rect = node.getBoundingClientRect();
        (rect as any).difference = Math.abs(event.clientY - rect.top);
        (rect as any).type = type;
        rects.push(rect as Rects);
      }
    })
    rects.sort((a, b) => a.difference - b.difference);
    const domBlock = document.elementFromPoint(rects[0].left, rects[0].top)?.closest('.block');
    if (!domBlock) {
      return;
    }

    if (rects[0].type === 'title') {
      blockSetCaretPos(domBlock, blockGetEndPos(domBlock))
    } else {
      const block = blockResolvePath(resolvedPaths.value[domBlock.getAttribute('id')?.replace('block-', '') || ''], props.page);
      if (block.content.length > 0) {
        const lastBlock = block.content[block.content.length - 1];
        const content = document.querySelector(`#block-${lastBlock.id}`);
        if (content) {
          blockSetCaretPos(content, blockGetEndPos(content))
        }
      } else {
        blockSetCaretPos(domBlock, blockGetEndPos(domBlock))
      }
    }
  }

  const handleBlockClick = (event: MouseEvent) => {
    if (event.ctrlKey || (event.shiftKey && origin === undefined)) {
      event.preventDefault();
      const block = (event.target as HTMLElement).closest('.block');
      if (block) {
        const id = block.getAttribute('id')?.replace('block-', '');
        if (id) {
          if (selections.value.has(id)) {
            block.classList.remove('block--selected');
            selections.value.delete(id);
          } else {
            block.classList.add('block--selected');
            selections.value.add(id);
          }
        }

        if (event.shiftKey) {
          origin = block.querySelector('.block-container .block-content')?.getBoundingClientRect();
        }
      }
    } else if (event.shiftKey) {
      event.preventDefault();
      const block = (event.target as HTMLElement).closest('.block');
      if (!block) {
        return;
      }
      const newRect = block.querySelector('.block-container .block-content')?.getBoundingClientRect();
      if (!newRect) {
        return;
      }

      const blocks = document.querySelectorAll(`#block-${props.page.id} .block`);
      blocks.forEach((block) => {
        const rect = block.querySelector('.block-container .block-content')?.getBoundingClientRect();
        if (!rect || !origin) {
          return;
        }
        const top = newRect.top < origin.top ? newRect.top : origin.top;
        const bottom = newRect.bottom > origin.bottom ? newRect.bottom : origin.bottom;

        if (!(
          rect.bottom < top || 
          rect.top > bottom
        )) {
          block.classList.add('block--selected');
          const id = block.getAttribute('id')?.replace('block-', '');
          if (id) {
            selections.value.add(id);
          }
        } else {
          block.classList.remove('block--selected');
          const id = block.getAttribute('id')?.replace('block-', '');
          if (id) {
            selections.value.delete(id);
          }
        }
      });
    }
  }

  const handleEditorScroll = (event: UIEvent) => {
    if (selector.value.active) {      
      const editor = document.querySelector('.block-page');
      const rect = editor?.getBoundingClientRect();
      if (rect && editor) {
        const obj = unref(selector);
        let newHeight = obj.height;
        const scroll = (event.target as HTMLElement).scrollTop;

        if (scroll < lastScroll) {
          // Scrolling up
          if (obj.bottom) {
            newHeight -= scroll - lastScroll;
          } else if (obj.top) {
            newHeight += scroll - lastScroll;
          }
        } else {
          // Scrolling down
          if (obj.bottom) {
            newHeight -= scroll - lastScroll;
          } else if (obj.top) {
            newHeight += scroll - lastScroll;
          }
        }

        if (newHeight < 0 && obj.top) {
          obj.bottom = editor.clientHeight - obj.start.top;
          obj.top = false;
          newHeight = Math.abs(newHeight);
        } else if (newHeight < 0 && obj.bottom) {
          obj.bottom = false;
          obj.top = obj.start.top;
        }

        lastScroll = (event.target as HTMLElement).scrollTop;
        obj.height = newHeight;
        handleSelectorUpdate(obj);
      }
    }
  }

  onMounted(() => {
    document.addEventListener('mouseup', handleEditorMouseUp)
    document.addEventListener('copy', handleEditorCopy)
  });
</script>

<template>
  <div
    class="block-page block-page-editor"
    :class="{
      'block-page--readOnly': readOnly,
      'block-page--dragging': dragging,
      'block-page--selection': selector.active,
    }"
    draggable="false"
    @dblclick="handleEditorDblMouseClick"
    @mousedown="handleEditorMouseDown"
    @mousemove="handleEditorMouseMove"
    @scroll="handleEditorScroll"
    @paste="handleEditorPaste"
  >
    <blocks-selection
      class="block-selector"
      :top="selector.top"
      :right="selector.right"
      :bottom="selector.bottom"
      :left="selector.left"
      :height="selector.height"
      :width="selector.width"
    />
    <blocks
      :page="page.id"
      :block="page"
      :readonly="readOnly"
      :parent="page.id"
      :path="[]"
      :undo-manager="undoManager"
      class="block-page-title"
      @click="handleBlockClick"
      @drag:active="(value: boolean) => dragging = value"
      @block:resolve="handleBlockResolve"
      @block:remove="handleBlockRemove"
      @block:insert="handleBlockInsert"
      @block:position:up="handleBlockPositionUp"
      @block:position:down="handleBlockPositionDown"
      @block:move:prev="handleBlockMovePrev"
      @block:move:next="handleBlockMoveNext"
    />
  </div>
</template>
