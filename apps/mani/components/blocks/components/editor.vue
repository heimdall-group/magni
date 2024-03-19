<script setup lang="ts">
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
    return props.html ? blockHTMLtoMarkdown(editor.value!.innerHTML) : editor.value!.innerText
  }

  const updateContent = (value: string) => {
    if (props.html) {
      editor.value!.innerHTML = blockMarkdownToHTML(value) + ' '
    } else {
      editor.value!.innerText = value
    }
    blockSetCaretPos(editor.value!, "end");
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    let text = e.clipboardData?.getData('text/plain')
    if (!text) {
      return
    }
    if(props.singleline) {
      text = text.replaceAll('\r\n', ' ');
      text = text.replaceAll('\n', ' ');
      text = text.replaceAll('\r', ' ');
    }
    document.execCommand('insertText', false, text)
  }

  watch(() => props.modelValue, (value) => {
    if(value != blockMarkdownToHTML(value)){
      updateContent(value)
    }
  })
  watch(() => props.html, ()  => {
    updateContent(props.modelValue)
  })
  watch(() => props.tag, ()  => {
    updateContent(props.modelValue);
  }, { flush: 'post' });
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
    @input="emits('update:modelValue', currentContent())"
    @blur="emits('update:modelValue', currentContent())"
    @paste="handlePaste"
    ref="editor"
  />
</template>

<style scoped>
  *[contenteditable] {
    padding: 8px;
  }
</style>