<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { blockGetCaretPos, blockHTMLtoMarkdown, blockMarkdownToHTML, htmlToMarkdown } from '../utils/index';

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

  const emits = defineEmits(['update:modelValue'])
  const editor = ref<HTMLElement | null>()

  const getCharacterLength = (characters: string[]) => {
    let length = 0;
    characters.forEach((char) => {
      switch(char) {
        case '\n': length--; break;
        case '\r': length--; break;
        case '\t': length--; break;
        case '\u003c': length = length + 4; break;
        case '\u003e': length = length + 4; break;
        case '\u00a0': length = length + 6; break;
        default: length++;
      }
    });
    return length;
  }

  const getStringSelectionStart = (selection: Selection) => {
    if (editor.value) {
      const { anchorOffset, focusOffset } = selection;
      const index = blockGetCaretPos(editor.value, 'markdown', anchorOffset < focusOffset ? 'anchorOffset' : 'focusOffset');
      return index; 
    }
    return 0
  }

  const setCaretPos = (pos: number) => {
    if (!editor.value) {
      return;
    }
    if (pos < 0) {
      pos = 0;
    }
    if (props.html) {
      let offsetNode;
      let offset = 0;

      const nodelist = editor.value.childNodes;
      for (const [i, node] of nodelist.entries()) {
        if (offset + (node.textContent?.length || 0) as number > pos || i === nodelist.length - 1) {
          offsetNode = node
          break
        }
        offset += node.textContent?.length as number
        offsetNode = node
      }
      if (!offsetNode) {
        offsetNode = editor.value;
      }

      console.log(pos, offset)
      pos -= offset;
      if (offsetNode.textContent && offsetNode.textContent.length < pos) {
        console.log('pos:', pos, 'length:', offsetNode.textContent.length)
        pos = offsetNode.textContent.length;
      }
      console.log(pos)
      const selection = window.getSelection()
      const range = document.createRange()
      range.setStart(offsetNode.firstChild || offsetNode, pos)
      range.setEnd(offsetNode.firstChild || offsetNode, pos)
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else {
      const selection = window.getSelection()
      const range = document.createRange()
      range.setStart(editor.value, pos)
      range.setEnd(editor.value, pos)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle all types of inputs except navigation keys
    const selection = window.getSelection();
    if (!editor.value || ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace')) {
      return;
    }
    // Handle backspace with selection
    if ((selection && selection.toString().length > 0) && event.key === 'Backspace') {
      const start = getStringSelectionStart(selection);
      const string = props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML;
      const selectionLength = getCharacterLength(selection.toString().split(''));
      const newValue = string.slice(0, start) + string.slice(start + selectionLength);
      emits('update:modelValue', newValue);
      return;
    }

    // handle backspace with Ctrl or Meta
    if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
      const index = blockGetCaretPos(editor.value, 'markdown');
      const string = props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML;
      const prevSpace = string.lastIndexOf(' ', index - 1);
      const newValue = string.slice(0, prevSpace === -1 ? 0 : prevSpace) + string.slice(index);
      emits('update:modelValue', newValue);
      return;
    }

    // Keep default navigation
    if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
      console.log('Preventing Event default')
      event.preventDefault();
    }

    let valueUpdated = false;
    switch(event.key) {
      case 'Enter': {
        if (props.singleline) {
          return;
        } else {
          // Insert \n at index
        }
      } break;
      case 'Backspace': {
        // Get index and splice from modelValue
        // If its subelement and props.html is true, node.textcontent === 0 remove node
        const selection = window.getSelection();
        const node = selection?.anchorNode?.parentElement;
        if (node) {
          if (props.html && node !== editor.value && node.textContent?.length === 1) {
            node.remove();
            valueUpdated = true;
          } else {
            let { anchorNode, anchorOffset } = selection;
            const index = blockGetCaretPos(editor.value, 'markdown');
            if (anchorNode && anchorNode.previousSibling && anchorNode.previousSibling.lastChild && anchorOffset === 0) {
              // Set cursor in span element
              anchorNode = anchorNode.previousSibling.lastChild;
              anchorOffset = anchorNode.textContent?.length as number;

              const range = document.createRange()
              range.setStart(anchorNode, anchorOffset)
              range.setEnd(anchorNode, anchorOffset)
              selection?.removeAllRanges()
              selection?.addRange(range)
            }
            if (anchorNode && anchorNode.textContent && (anchorOffset > 0 || index > 0)) {
              (anchorNode as any).deleteData(anchorOffset - 1, 1);
              valueUpdated = true;
            }
          }
        }

      } break;
      default: {
        if (event.key.length === 1 && !(event.metaKey && event.ctrlKey)) {
          // Get index and splice key into modelValue
          let key = event.key;
          switch (key) {
            case '<': key = '\u003c'; break;
            case '>': key = '\u003e'; break;
            case '&': key = '&amp;'; break;
            case '"': key = '&quot;'; break;
            case '\'': key = '&#39;'; break;
            case ' ': key = '\u00a0'; break;
          }

          if (selection) {
            const range = selection.getRangeAt(0);
            const textNode = document.createTextNode(key);
            range.insertNode(textNode);
            range.setStart(textNode, 1);
            range.setEnd(textNode, 1);
            selection.removeAllRanges();
            selection.addRange(range);
            editor.value.normalize();
            valueUpdated = true;
          }
        }
      } break;
    }

    if(valueUpdated) {
      if (props.html) {
        emits('update:modelValue', blockHTMLtoMarkdown(editor.value.innerHTML));
      } else {
        emits('update:modelValue', editor.value.innerHTML);
      }
    }

  }

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
  <component
    class="block-editor"
    :html="props.html"
    :is="tag"
    spellcheck="false"
    translate="no"
    :contenteditable="!readonly"
    @keydown="handleKeyDown"
    ref="editor"
  />
  <br>
  {{ modelValue }}
</template>

<style scoped>
  *[contenteditable] {
    padding: 8px;
  }
</style>