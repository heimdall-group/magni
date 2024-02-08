<script setup lang="ts">
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import { Editor, EditorContent } from '@tiptap/vue-3'
import type { VueElement } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  })
  const emits = defineEmits(['update:modelValue']);
  const editor = ref<Editor | undefined>();
  const editorRef = ref<InstanceType<typeof VueElement> | null>(null);

  onMounted(() => {
    editor.value = new Editor({
      editorProps: {
        attributes: {
          class: 'block-editor'
        }
      },
      extensions: [
        Bold,
        Document,
        History,
        Strike,
        Underline,
        Italic,
        Link,
        Paragraph,
        Placeholder.configure({
          placeholder: 'Type \'/\' for a menu'
        }),
        Text,
        
      ],
      content: blockMarkdownToHTML(props.modelValue),
      onUpdate: () => emits('update:modelValue', blockHTMLtoMarkdown(editor.value?.getHTML() || '')),
    });
  })

  watch(() => props.modelValue, value => {
    const isSame = blockHTMLtoMarkdown(editor.value?.getHTML() || '') === value
    if (isSame) return
    editor.value?.commands.setContent(blockMarkdownToHTML(value), false)
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  defineExpose({
    editorRef,
    editor,
  })
</script>

<template>
  <editor-content
    v-if="!readonly"
    class="w-100"
    ref="editorRef"
    :editor="editor"
    @keyup.enter.capture.prevent="() => {}"
    @keydown.enter.capture.prevent="() => {}"
  />
  <div v-else class="block-read-only" v-html="blockMarkdownToHTML(props.modelValue)" />
</template>
