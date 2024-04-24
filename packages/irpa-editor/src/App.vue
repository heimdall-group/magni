<script setup lang="ts">
  import BlockEditor from './components/block-editor.vue';
  import { onMounted, ref } from 'vue';
  import { IrpaUndoManager } from 'irpa-undo-manager'


  const test = ref('test *test* **test** __test__ ~~test~~');
  const test2 = ref('Jag blir sur om detta inte fungerar');
  const test3 = ref('*t*');
  const undoManager = new IrpaUndoManager();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'z') {
      undoManager.undo();
    } else if (event.ctrlKey && event.key === 'y') {
      undoManager.redo();
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })
</script>

<template>
  <block-editor overwrite-caret-position :undo-manager="undoManager" html :readonly="false" v-model="test" />
  <block-editor overwrite-caret-position :undo-manager="undoManager" html :readonly="false" v-model="test2" />
  <block-editor overwrite-caret-position :undo-manager="undoManager" html :readonly="false" v-model="test3" />
</template>
