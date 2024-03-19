<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { blockHTMLtoMarkdown, blockMarkdownToHTML } from '../../../utils/useBlock';

  const props = defineProps({
    'modelValue': {
      type: String,
      required: true,
    },
    'tag': {
      type: String,
      default: 'div',
    },
    'readonly': {
      type: Boolean,
      required: true,
    },
    'html' : {
      type : Boolean,
      default : false,
    },
    'singleline' : {
      type : Boolean,
      default : false,
    },
  })

  const emits = defineEmits(['returned', 'update:modelValue'])
  const editor = ref<HTMLElement | null>()

  const currentContent = () => {
    const string = props.html ? blockHTMLtoMarkdown(editor.value!.innerHTML) : editor.value!.innerText
    return string
  }

  const handleKeyUp = (event: KeyboardEvent) => {
  // Check if the key is Backspace
  // Check if the Control key or the Command key is pressed
  if ((event.ctrlKey || event.metaKey) && ['b', 'i', 'u'].includes(event.key)) {
    event.preventDefault();
    // Handle the formatting command
  }
  if (event.key === 'Backspace') {
    // Delay the check until after the browser's default action
    // setTimeout(() => {
      // Check if the contenteditable is empty
      if (editor.value && editor.value.textContent === '') {
        // Clear the HTML content
        console.log('Clear innerHTML')
        editor.value.innerHTML = '';
      }
    // }, 0);
  }
}

  let blockWatchUpdate = false
  const handleInput = (type: 'user-input' | 'watch-update') => {
    if (type === 'user-input') {
      console.log(type)
      blockWatchUpdate = true
      emits('update:modelValue', currentContent())
      return;
    } else if (type === 'watch-update' && !blockWatchUpdate) {
      console.log('handle watch update')
      return;
    } else {
      blockWatchUpdate = false
    }

    if (props.html && editor.value && editor.value.innerHTML !== blockMarkdownToHTML(editor.value.innerHTML)) {
      editor.value!.innerHTML = blockMarkdownToHTML(props.modelValue);
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(editor.value, editor.value.childNodes.length);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  // Works in firefox not chrome

  watch(() => props.modelValue, () => handleInput('watch-update'))
  onMounted(() => {
    if (editor.value) {
      if (props.html) {
        editor.value.innerHTML = blockMarkdownToHTML(props.modelValue);
      } else {
        editor.value.innerText = props.modelValue;
      }
    }
  });
</script>

<template>
  <button @click="() => {
    if (editor && editor.innerHTML) {
      editor.innerHTML = ''
    }
  }">reset</button>
  <component
    class="block-editor"
    :html="props.html"
    :is="tag"
    spellcheck="false"
    translate="no"
    :contenteditable="!readonly ? 'plaintext-only' : 'false'"
    @keyup="handleKeyUp"
    @input="handleInput('user-input')"
    @blur="handleInput('user-input')"
    ref="editor"
  />
</template>

<style scoped>
  *[contenteditable] {
    padding: 8px;
  }
</style>