<script setup lang="ts">
  const content = ref<{[key: string]: any}>({})
  const props = defineProps({
    block: {
      type: Object as PropType<Block>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(['keydown']);

  const blurHandler = (rowIndex: number, columnIndex: number) => {
    const { block } = props;
    if (!block.properties.table) {
      return;
    }
    block.properties.table[rowIndex][columnIndex].content = content.value[`${rowIndex}-${columnIndex}`].textContent;
  }
</script>

<template>
  <div class="block-table">
    <div 
      v-for="(row, rowIndex) in props.block.properties.table"
      class="block-table-row"
    >
      <div
        v-for="(column, columnIndex) in row"
        class="block-table-column"
        :style="{width: `${column.width}px`}"
      >
        <div
          data-type="table"
          :data-row="rowIndex"
          :data-cell="columnIndex"
          :data-cells="row.length"
          :ref="(el) => content[`${rowIndex}-${columnIndex}`] = el"
          :key="props.block.type"
          :contenteditable="!props.readonly"
          @keydown="emits('keydown', $event, content[`${rowIndex}-${columnIndex}`])"
          @blur="blurHandler(rowIndex, columnIndex)"
          spellcheck="false"
          translate="no"
        >
          {{ column.content }}
        </div>
        <div class="block-table-width-indicator">

        </div>
      </div>
    </div>
  </div>
</template>
