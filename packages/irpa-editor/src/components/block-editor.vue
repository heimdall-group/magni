<script setup lang="ts">
  import { ref, onMounted, PropType, watch } from 'vue';
  import { blockGetCaretPos, blockSetCaretPos, blockHTMLtoMarkdown, blockMarkdownToHTML, htmlTranslations } from 'irpa-utils';
  import { IrpaUndoManager } from 'irpa-undo-manager'

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
    'undoManager' : {
      type : Object as PropType<IrpaUndoManager>,
      default : false,
    },
    'overwriteCaretPosition': {
      type: Boolean,
      default: false,
    },
    'debug': {
      type: Boolean,
      default: false,
    }
  })
  const undoManager = props.undoManager || new IrpaUndoManager(props.debug);
  if (props.debug) {
    undoManager.setDebug(true);
  }

  const emits = defineEmits(['update:modelValue']);
  const editor = ref<HTMLElement | null>();
  const componentPrefix = `${new Date().getTime().toString(36)}-${Math.random().toString(36).substring(2, 15)}`
  const inputName = `${componentPrefix}-Input`;
  const backspaceName = `${componentPrefix}-Backspace`;
  let prevAction: 'backspace' | 'input' | undefined;
  let contentPreInput: string | undefined;
  let contentInSelection: string = '';
  let contentInBundle: string = '';

  const setContent = (data: {
    value: string,
    pos: number,
  }) => {
    const selection = window.getSelection();
    if (editor.value && selection) {
      let { value, pos } = data;
      if (props.html) {
        editor.value.innerHTML = blockMarkdownToHTML(value);
      } else {
        editor.value.innerHTML = value;
      }
      if (props.overwriteCaretPosition || editor.value.contains(selection.anchorNode)) {
        blockSetCaretPos(editor.value, pos);
      }
      contentInBundle = '';
      emits('update:modelValue', props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
    }
  }

  const revert = (data: {
    revert: string,
    perform: string,
    revertPos: number,
    performPos: number,
  }) => {setContent({value: data.revert, pos: data.revertPos})}

  const perform = (data: {
    revert: string,
    perform: string,
    revertPos: number,
    performPos: number,
  }) => {setContent({value: data.perform, pos: data.performPos})}
  undoManager.use(inputName, {revert, perform});
  undoManager.use(backspaceName, {revert, perform});

  const removeCharacter = (node: CharacterData, pos: number, length: number) => {
    node.deleteData(pos, length);
  }

  const insertCharacter = (range: Range, string: string) => {
    const node = document.createTextNode(string)
    range.insertNode(node);
    range.setStart(node, string.length);
    range.setEnd(node, string.length);
  }

  const setSelection = (node: HTMLElement, pos: number) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(node, pos);
    range.setEnd(node, pos);
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const handleBundle = (action: 'backspace' | 'input', event: KeyboardEvent, type?: 'selection' | 'ctrl') => {
    const { key } = event
    if (!editor.value) {
      return;
    }
    const difference = getChanges(contentPreInput as string, props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
    switch(action) {
      case 'backspace':
        // check if its ctrl backspace or selection backspace
        const selection = window.getSelection();
        if (selection) {
          if (type === 'selection' || (event.ctrlKey || event.metaKey)) {
            // Create new log for backspace
            undoManager.log(backspaceName, {
              revert: contentPreInput as string,
              perform: props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML,
              revertPos: blockGetCaretPos(editor.value) + contentInSelection.length,
              performPos: blockGetCaretPos(editor.value),
            }, false);
            contentInBundle = '';
            contentInSelection = '';
          } else {
            // Check if we can bundle backspace
            if (prevAction !== 'backspace') {
              undoManager.log(backspaceName, {
                revert: contentPreInput as string,
                perform: props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML,
                revertPos: blockGetCaretPos(editor.value) + 1,
                performPos: blockGetCaretPos(editor.value),
              }, false);
              contentInBundle = difference;
            } else {
              undoManager.addToLog(backspaceName, {
                perform: props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML,
                performPos: blockGetCaretPos(editor.value),
              }, false);
              contentInBundle += difference;
            } 
          }
        }
        break;
      case 'input':
        if ((key === ' ' && contentInBundle.trim() !== '') || prevAction !== 'input') {
          undoManager.log(inputName, {
            revert: contentPreInput as string,
            perform: props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML,
            revertPos: blockGetCaretPos(editor.value) - 1,
            performPos: blockGetCaretPos(editor.value),
          }, false);
          contentInBundle = difference;
        } else {
          contentInBundle += difference;
          undoManager.addToLog(inputName, {
            perform: props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML,
            performPos: blockGetCaretPos(editor.value),
          }, false);
        }
        break;
    }
    prevAction = action;
  }

  const getChanges = (oldValue: string, newValue: string) => {
    let i = 0;
    let j = 0;
    let result = "";

    while (j < newValue.length) {
      if (oldValue[i] != newValue[j] || i == oldValue.length) {
        result += newValue[j];
      } else {
        i++;
      }
      j++;
    }
    return result;
  }

  const getPrevNode = (node: HTMLElement | null | undefined): HTMLElement | null | undefined => {
    const nodeIsEditor = node === editor.value;
    const isInline = nodeIsEditor ? false : node?.parentElement !== editor.value;
    const prevNode = (isInline ? node?.previousElementSibling?.parentElement : node?.previousElementSibling) as HTMLElement | undefined;
    const prevIsInline = prevNode?.parentNode === editor.value;

    if (prevIsInline && prevNode) {
      if ((prevNode.textContent?.length || 0) > 0) {
        return prevNode.lastChild as HTMLElement | undefined;
      } else {
        return getPrevNode(prevNode)
      }
    }
    // Might need to accept more handling
  }

  const handleBackspace = (event: KeyboardEvent) => {
    const selection = window.getSelection();
    const timeoutHandler = (type: 'selection' | 'ctrl') => {
      if (editor.value) {
        handleBundle('backspace', event, type);
        emits('update:modelValue', props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
      }
    }
    if (!selection || !editor.value) {
      return;
    }

    // Handle backspace with selection
    if ((selection && selection.toString().length > 0) && event.key === 'Backspace') {
      // Prevents browser from adding a <br> tag into the editor
      if (selection.toString() === editor.value.innerText) {
        contentInSelection = editor.value.innerText;
        setTimeout(() => {
          const br = editor.value?.querySelector('br');
          if (br) {
            br.remove();
          }
          timeoutHandler('selection');
        }, 0);
        
      } else {
        // Could cause issues with event loop. Keep for now since bundle size is smaller without us having to update the innerHTML
        setTimeout(() => timeoutHandler('selection'), 0);
      }
      return;
    }

    // Handle backspace with Ctrl or Meta
    if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
      // Could cause issues with event loop. Keep for now since bundle size is smaller without us having to update the innerHTML
      setTimeout(() => timeoutHandler('ctrl'), 0);
      return;
    }

    event.preventDefault();
    const {anchorNode, anchorOffset} = selection;
    const node = anchorNode?.parentElement;
    if (node && editor.value.contains(node) && editor.value !== node && node.textContent?.length === 1) {
      const prevNode = node?.previousSibling;
      if (prevNode && prevNode.lastChild && anchorOffset === 0) {
        setSelection((prevNode.lastChild as HTMLElement), prevNode.lastChild.textContent?.length || 0);
      } else if (prevNode) {
        setSelection((prevNode as HTMLElement), prevNode.textContent?.length || 0);
      }
      event.stopPropagation();
      node.remove();
    } else {
      if (anchorNode && anchorOffset > 0) {
        event.stopPropagation();
        removeCharacter((anchorNode as CharacterData), anchorOffset - 1, 1);
      } else {
        const prevNode = getPrevNode(anchorNode as HTMLElement);
        if (prevNode) {
          event.stopPropagation();
          removeCharacter((prevNode as unknown as CharacterData), prevNode.textContent?.length as number - 1, 1);
          setSelection((prevNode as HTMLElement), prevNode.textContent?.length || 0);
        }
      }
    }
    handleBundle('backspace', event);
    emits('update:modelValue', props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
  }

  const handleEnter = (event: KeyboardEvent) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (event.shiftKey && selection && range && editor.value) {
      insertCharacter(range, '\n');
      selection.removeAllRanges();
      selection.addRange(range);
      editor.value.normalize();
      emits('update:modelValue', props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
      handleBundle('input', event);
    }
  }

  const handleInput = (event: KeyboardEvent) => {
    if (!editor.value) {
      return;
    }
    // Handle undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      event.stopPropagation();
      undoManager.undo();
      return;
    }

    // Handle redo
    if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      event.stopPropagation();
      undoManager.redo();
      return;
    }

    // Keep default navigation
    if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key.length === 1 && !(event.metaKey && event.ctrlKey)) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      if (selection && range && editor.value) {

        // Check if key is markdown syntax
        if (Object.values(htmlTranslations).includes(event.key)) {
          insertCharacter(range, event.key);
          editor.value.normalize();
          const string = editor.value.innerHTML;
          const html = blockMarkdownToHTML(string);
          // Get length of the markdown content
          if (html !== string) {


            const difference = getChanges(string, html);
            const element = new DOMParser().parseFromString(difference, 'text/html').body.childNodes[0];
            const syntax = htmlTranslations[(element as HTMLElement).tagName.toLowerCase() as keyof typeof htmlTranslations];
            const { anchorNode, anchorOffset } = selection;
            if (syntax && anchorNode && anchorNode.nodeType === 3) {
              const length = syntax.length * 2 + (element.textContent?.length || 0);
              removeCharacter(anchorNode as CharacterData, anchorOffset - length, length);
              const node = document.createTextNode('');
              range.insertNode(node);
              range.insertNode(element);
              range.setStart(node, node.textContent?.length || 0);
              range.setEnd(node, node.textContent?.length || 0);
            }
          } 
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          insertCharacter(range, event.key);
          selection.removeAllRanges();
          selection.addRange(range);
          editor.value.normalize();
        }

        emits('update:modelValue', props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML);
        handleBundle('input', event);
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Check what function to call
    if (!editor.value || ((event.ctrlKey || event.metaKey) && !['Backspace', 'z', 'y'].includes(event.key))) {
      console.log('Either no editor or command that isnt undo, redo or backspace')
      return;
    }
    contentPreInput = props.html ? blockHTMLtoMarkdown(editor.value.innerHTML) : editor.value.innerHTML;
    switch(event.key) {
      case 'Backspace':
        handleBackspace(event);
        break;
      case 'Enter':
        handleEnter(event);
        break;
      default:
        handleInput(event);
        break;
    }
  }

  watch(() => props.modelValue, (newValue) => {
    const value = props.html ? blockMarkdownToHTML(newValue) : newValue;
    if (editor.value && document.activeElement === editor.value && editor.value.innerHTML !== value) {
      const pos = blockGetCaretPos(editor.value);
      setContent({value: newValue, pos});
    } else if (document.activeElement !== editor.value) {
      if (editor.value) {
        if (props.html) {
          editor.value.innerHTML = blockMarkdownToHTML(newValue);
        } else {
          editor.value.innerText = newValue;
        }
      }
    }
    

  });

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
    class="irpa-block-editor"
    :html="props.html"
    :is="tag"
    spellcheck="false"
    translate="no"
    :contenteditable="!readonly"
    @keydown="handleKeyDown"
    ref="editor"
  />
</template>
