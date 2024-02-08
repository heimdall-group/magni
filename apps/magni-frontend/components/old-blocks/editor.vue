<script setup lang="ts">
import type { PropType } from 'vue';
import type { VueElement } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next'

  const props = defineProps({
    page: {
      type: Object as PropType<Block>,
      required: true
    }
  });

  const emits = defineEmits(['update:modelValue'])
  const readonly = ref(false);
  const editor = ref<InstanceType<typeof VueElement>>()
  const title = ref<InstanceType<typeof VueElement>>()
  const blockRefs = ref<InstanceType<typeof VueElement>[]>([]);

  const handleBlockRemove = (
    block: Block,
    index: number,
    ref: InstanceType<typeof VueElement>
  ) => {
    console.log(block)
    console.log(index)
    console.log(ref);
    // Remove current block. Take content and pass to blocks -1
    // If its the last block just do nothing
  }

  const handleBlockInsert = (
      block: Block,
      index: number,
      ref: InstanceType<typeof VueElement>,
      type: Block["type"],
      parent: Block["id"],
      event?: MouseEvent
    ) => {
    console.log(block)
    console.log(index)
    console.log(type)
    console.log(ref);
    console.log(parent);
    const newBlock: Block = blockGetNewBlock(type, parent);
    blockSetProperties(newBlock, type);
    if (event && event.type === 'click') {
      
    }

    // const pos = blockGetCaretPos(ref);
    // console.log(pos)

    // If enter is pressed mid block split content into a new block
    // Just create a new block and grab all the content "left"
  }

  const handleBlockPositionUp = (block: Block, index: number, ref: InstanceType<typeof VueElement>) => {
    console.log('move block up')
    console.log(ref);
  }

  const handleBlockPositionDown = (block: Block, index: number, ref: InstanceType<typeof VueElement>) => {
    console.log('move block down')
    console.log(ref);
  }

  const handleBlockMovePrev = (block: Block, index: number, ref: InstanceType<typeof VueElement>, key: 'ArrowUp' | 'ArrowLeft') => {
    if (!handleBlockTypes(block, index, ref, key, 'end', 'ArrowUp', 'ArrowLeft', -1)) {
      const pos = blockGetCaretPos(ref).pos || 0;
      const {prevBlock, prevBlockRef} = blockGetPrevBlock(props.page.content, blockRefs, index)
      if (!prevBlock || !prevBlockRef) {
        console.error('Couldnt find previous block')
        return
      }
      if (prevBlock.type.includes('columns')) {
        const columns = ((prevBlockRef as any).content as any).$el;
        const amount = columns.dataset.type.replace('columns_', '');
        const firstColumn = columns.querySelector(`[data-column="${amount - 1}"]`);
        if (firstColumn) {
          if (key === 'ArrowLeft') {
            blockSetCaretPos(firstColumn, firstColumn.textContent?.length || 0)
            return
          }
          blockSetCaretPos(firstColumn, blockGetNewPos(firstColumn, pos))
          return
        }
        return
      } else if (prevBlock.type === 'table') {
        const table = ((prevBlockRef as any).content as any).$el;
        const row = (prevBlock.properties.table?.length || 1) - 1;
        if (table) {
          const prevEditor = [...table.querySelectorAll(`[data-row="${row}"]`)].reverse()[0];
          if (prevEditor) {
            if (key === 'ArrowLeft') {
              blockSetCaretPos(prevEditor, prevEditor.textContent?.length || 0)
              return
            }
            blockSetCaretPos(prevEditor, blockGetNewPos(prevEditor, pos))
            return
          }
        }
      }
      const lastChild = blockGetLastChild(prevBlockRef);
      if (key === 'ArrowLeft') {
        blockSetCaretPos(prevBlockRef, lastChild?.textContent?.length || 0, lastChild)
      } else {
        blockSetCaretPos(prevBlockRef, blockGetNewPos(prevBlockRef, pos), lastChild)
      }
    }
  }

  const handleBlockMoveNext = (
    block: Block,
    index: number,
    ref: InstanceType<typeof VueElement>,
    key: 'ArrowDown' | 'ArrowRight',
  ) => {
    if (!handleBlockTypes(block, index, ref, key, 'start', 'ArrowDown', 'ArrowRight', 1)) {
      const {nextBlock, nextBlockRef} = blockGetNextBlock(props.page.content, blockRefs, index);
      if (!nextBlock || !nextBlockRef) {
        console.error('Couldnt find next block')
        return
      };
      const firstChild = blockGetFirstChild(nextBlockRef);
      if (key === 'ArrowRight') {
        blockSetCaretPos(nextBlockRef, 0, firstChild)
      } else {
        const pos = blockGetCaretPos(ref).pos || 0;
        blockSetCaretPos(nextBlockRef, blockGetNewPos(nextBlockRef, pos), firstChild)
      }
    }
  }
  // Navigation in specific blocks
  const handleBlockTypes = (
    block: Block,
    index: number,
    ref: InstanceType<typeof VueElement>,
    key: 'ArrowDown' | 'ArrowRight' | 'ArrowUp' | 'ArrowLeft',
    defaultPos: 'start' | 'end',
    verticalOperator: 'ArrowUp' | 'ArrowDown',
    horizontalOperator: 'ArrowLeft' | 'ArrowRight',
    numericOperator: number,
    
  ): boolean => {
    // If current block is columns
    if (block.type.includes('columns')) {
      const { column } = (ref as any).$el.dataset;
      if (!column) {
        console.error('Couldnt find column')
        return false
      }
      const columns = ((blockRefs.value[index] as any).content as any).$el;
      const newColumn = columns.querySelector(`[data-column="${parseInt(column) + numericOperator}"]`);
      if (newColumn) {
        // Get position of caret in current block
        const pos = blockGetCaretPos(ref).pos || 0;
        // If key is ArrowLeft or ArrowRight it wont have start position
        if (key === horizontalOperator) {
          if (defaultPos === 'start') {
            // Just set at start of next column
            blockSetCaretPos(newColumn, 0)
            return true
          } else {
            // Get lastChild of next column and set caret at end
            const lastChild = blockGetLastChild(newColumn);
            blockSetCaretPos(newColumn, lastChild?.textContent?.length || 0, lastChild)
            return true
          }
        }
        // Set caret at same position in next column
        blockSetCaretPos(newColumn, blockGetNewPos(newColumn, pos))
        return true
      }

    // If current block is table
    } else if (block.type === 'table') {
      let { cell, cells, row } = ref.dataset;
      let pos = blockGetCaretPos(ref).pos || 0;
      if (!cell || !cells || !row) {
        console.error('Couldnt find cell, cells or row')
        return false
      }
      // Checks if key is either ArrowLeft or ArrowRight
      if (key === horizontalOperator) {
        pos = 0;
        // If movement is block:move:next
        if (numericOperator === 1) {
          if (parseInt(cell) + numericOperator < parseInt(cells)) {
            cell = (parseInt(cell) + numericOperator).toString();
          } else {
            // Go to next row and first cell
            cell = '0';
            row = (parseInt(row) + numericOperator).toString();
          }
        // If movement is block:move:prev
        } else if (numericOperator === -1) {
          // Go to previous row if cell is 0
          // Else decrement cell with 1
          if (parseInt(cell) - 1 >= 0) {
            cell = (parseInt(cell) - 1).toString();
          } else {
            // Go to next row and last cell
            cell = (parseInt(cells) - 1).toString();
            row = (parseInt(row) - 1).toString();
          }
        }
      // Checks if key is either ArrowUp or ArrowDown
      } else if (key === verticalOperator) {
        // Go to next row and same cell
        row = (parseInt(row) + numericOperator).toString();
      }
      const table = ((blockRefs.value[index] as any).content as any).$el;
      const newCell = table ? table.querySelector(`[data-row="${row}"][data-cell="${cell}"]`) : undefined;
      if (newCell) {
        // Check if key is ArrowLeft or ArrowRight
        if (key === horizontalOperator) {
          if (defaultPos === 'start') {
            // Set caret at start of new cell
            blockSetCaretPos(newCell, 0)
            return true
          } else {
            // Get lastChild of new cell and set caret at end
            const lastChild = blockGetLastChild(newCell);
            blockSetCaretPos(newCell, lastChild?.textContent?.length || 0, lastChild)
            return true
          }
        }
        // Set caret at same position in new cell in another row
        blockSetCaretPos(newCell, pos)
        return true
      }
    }
    return false
  }

  const handleEditorMouseUp = (event: MouseEvent) => {
    // Get block of closest element to mouseup event
    const rects: DOMRect[] = [];
    [title.value, ...blockRefs.value].forEach((block) => {
      if (!block) {
        return;
      }
      const { container } = blockGetEditor(block);
      if (container) {
        rects.push(container.getBoundingClientRect());
      }
    });
    rects.sort(a => (a.top - (a.height / 2)) - event.clientY);
    const block = document.elementFromPoint(rects[0].left, rects[0].top);
    if (!block) {
      return;
    }
    const lastChild = blockGetLastChild((block as VueElement));
    blockSetCaretPos((block as VueElement), lastChild?.textContent?.length || 0, lastChild)
  }
  onBeforeUpdate(() => blockRefs.value = []);
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
    ref="editor"
    @mouseup="handleEditorMouseUp"
  >
  <ClientOnly>
      <vue-draggable-next id="page-blocks" :list="page.content" handle=".block-handle">
        <transition-group>
          <old-blocks
            v-for="(block, index) in page.content"
            :key="`editor-block-${index}`"
            ref="blockRefs"
            :parent="page.id"
            :block="block"
            :readonly="readonly"
            :page="page.id"
            @mouseup.stop="() => {}"
            @block:remove="(ref: VueElement) => handleBlockRemove(block, index, ref)"
            @block:insert="(ref: VueElement, type: Block['type'], parent: Block['id'], event: MouseEvent) => handleBlockInsert(block, index, ref, type, parent, event)"
            @block:position:up="(ref: VueElement) => handleBlockPositionUp(block, index, ref)"
            @block:position:down="(ref: VueElement) => handleBlockPositionDown(block, index, ref)"
            @block:move:prev="(ref: VueElement, key: 'ArrowUp' | 'ArrowLeft') => handleBlockMovePrev(block, index, ref, key)"
            @block:move:next="(ref: VueElement, key: 'ArrowDown' | 'ArrowRight') => handleBlockMoveNext(block, index, ref, key)"
          />
        </transition-group>
      </vue-draggable-next>
    </ClientOnly>
  </div>
</template>
