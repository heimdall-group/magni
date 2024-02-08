import { VueElement, type WritableComputedRef } from "vue";




// Make sure the order of these are correct. 
const patterns = {
  heading_1: /^#\s(.*)$/,
  heading_2: /^##\s(.*)$/,
  heading_3: /^###\s(.*)$/,
  heading_4: /^####\s(.*)$/,
  heading_5: /^#####\s(.*)$/,
  quote: /^>\s(.*)$/,
}

// Only object using editor. Other blocks will not include editor since they dont support markdown.
const textBlockTypes = ['paragraph', 'quote', 'columns_2', 'columns_3', 'columns_4', 'columns_5'];
const textBlockMarkdownTags = ['strong', 'em', 'u', 'del'];

const contentBlocks = [
  'heading_1',
  'heading_2',
  'heading_3',
  'heading_4',
  'heading_5',
  'paragraph',
  'to_do',
  'bulleted_list',
  'toggle_list',
  'table',
  'code',
  'quote',
  'toggle_heading_1',
  'toggle_heading_2',
  'toggle_heading_3',
  'columns_2',
  'columns_3',
  'columns_4',
  'columns_5',
];



const updateBlock = (blocks: Ref<Array<Block>>, { id, pageId, path, block }: UpdateBlock) => {
  // Wtf is this pos function. Remake so it loops through path and actully able to nest down the path.
  const parent = blocks.value.find((blocks) => blocks.id === path[path.length - 2])
  if (!parent) {
    throw createError('Couldnt find parent')
  }

  const target = parent.content.find((blocks) => typeof blocks !== 'string' ? blocks.id === block.id : false);
  if (!target) {
    throw createError('Couldnt find target block')
  }
  Object.assign(target, block)
}

/**
 * Checks if user has hightlighted content on page
 * @returns {Number}
 */
const highlightedBlock = () => {
  return window.getSelection()?.toString().length
}

/**
 * Helper function for when checking cursor position.
 * @param node 
 * @param position 
 * @returns {Boolean}
 */
const blockCursorPosition = (node: HTMLElement, position: 'start' | 'end') => {
  const selection = window.getSelection()
  const { type }: {type: Block["type"]} = node.dataset as {type: Block["type"]};
  if (!selection) {
    throw createError('Couldnt find selection')
  }
  
  switch(position) {
    case 'start':
      return selection.anchorOffset === 0
      break;
    case 'end':
      return selection.anchorOffset === node.textContent?.length
      break;
    default:
      return false
  }
}

// Returns first child of editor if its in textBlockTypes
const blockGetFirstChild = (ref: InstanceType<typeof VueElement>) => {
  const {type, editor, container} = blockGetEditor(ref);
  if (editor) {
    if (container.firstChild?.firstChild?.childNodes?.length !== undefined && container.firstChild?.firstChild?.childNodes?.length > 0) {
      return container.firstChild?.firstChild.firstChild
    }
    return container.firstChild?.firstChild
  } else {
    return container.firstChild;
  }
}

// Returns last child of editor if its in textBlockTypes
const blockGetLastChild = (ref: InstanceType<typeof VueElement>) => {
  const {type, editor, container} = blockGetEditor(ref);
  if (editor) {
    if (container.firstChild?.lastChild?.childNodes?.length !== undefined && container.firstChild?.lastChild?.childNodes?.length > 0) {
      return container.firstChild?.lastChild.lastChild
    }
    return container.firstChild?.lastChild
  } else {
    return container.lastChild;
  }
}

const isTextBlock = (type: string) => {
  return textBlockTypes.some(textBlock => textBlock === type)
}

const blockGetEditor = (ref: InstanceType<typeof VueElement>): {
  editor: boolean,
  type: Block["type"] | null,
  container: HTMLElement,
} => {
  const type = getType(ref);
  const editor = (function(){
    if ((ref as any).classList && (ref as any).classList.contains('block-editor')) {
      return (ref as any)
    } else if ((ref as any).querySelector) {
      return (ref as any).querySelector('.block-editor')
    } else if ((ref as any).$el && (ref as any).$el.querySelector) {
      return (ref as any).$el.querySelector('.block-editor')
    }
    return null;
  }());
  const container = (function(){
    if (editor) {
      return editor
    } 
    if ((ref as any).$el && (ref as any).$el.getAttribute('contenteditable')) {
      return (ref as any).$el
    } else if ((ref as any).$el && (ref as any).$el.querySelector) {
      return (ref as any).$el.querySelector('*[contenteditable]')
    } else if ((ref as any).getAttribute('contenteditable')) {
      return ref;
    } else {
      return (ref as any).$el
    }
  }())

  return {
    editor: editor !== null,
    type,
    container,
  };
};

const getType = (ref: InstanceType<typeof VueElement>): Block["type"] | null => {
  if ((ref as any).$el) {
    return ((ref as any).$el.dataset as {type: Block["type"]}).type;
  } else if((ref as any).type) {
    return (ref as any).type;
  } else {
    return null;
  }
}

const blockGetCaretPos = (ref: InstanceType<typeof VueElement>, includeTag: boolean = false) => {
  const selection = window.getSelection()
  if (!selection || 
    ((selection.anchorNode as HTMLElement)?.classList &&
    (selection.anchorNode as HTMLElement)?.classList.contains('is-empty'))
  ) {
    return { pos: 0 };
  }
  
  let offset = 0
  let tag = null
  const {type, editor, container} = blockGetEditor(ref);
  const nodelist = editor ? container.firstChild?.childNodes || [] : container.childNodes || [];
  for (let i = 0; i < nodelist.length; i++) {
    const node = nodelist[i] as HTMLElement;
    if (node === selection.anchorNode || node === selection.anchorNode?.parentNode) {
      if (textBlockMarkdownTags.includes((node.tagName || '').toLowerCase())) {
        tag = node.tagName.toLowerCase();
        if (includeTag) {
          offset += tag.length + 2;
        }
      }
      break
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      offset += node.outerHTML.length
    }
    else if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent?.length || 0
    }
  }
  return { pos: offset + selection.anchorOffset, tag }
}

const blockGetCaretCoordinates = () => {
  let x = 0;
  let y = 0;
  const selection = window.getSelection()
  if((selection?.rangeCount as number) === 0) {
    return { x, y };
  }

  const range = selection?.getRangeAt(0)
  if (range?.startContainer.firstChild) {
    const newRange = document.createRange()
    newRange.selectNodeContents(range.startContainer.firstChild)
    newRange.collapse(true)
    const rect = newRange.getBoundingClientRect()
    return rect
  }
  const rect = range?.getBoundingClientRect()
  return rect
}

const blockAtFirstChar = (ref: InstanceType<typeof VueElement>) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === startCoord.x && coord?.y === startCoord.y
}

const blockAtLastChar = (ref: InstanceType<typeof VueElement>) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === endCoord.x && coord?.y === endCoord.y
}

const blockAtFirstLine = (ref: InstanceType<typeof VueElement>) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === startCoord.y
}

const blockAtLastLine = (ref: InstanceType<typeof VueElement>) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === endCoord.y
}

const blockGetStartCoordinates = (ref: InstanceType<typeof VueElement>) => {
  let x = 0, y = 0
  const firstChild = blockGetFirstChild(ref)
  if (firstChild) {
    const range = document.createRange()
    range.selectNodeContents(firstChild.firstChild || firstChild)
    range.collapse(true)
    const rect = range.getBoundingClientRect()
    x = rect.left
    y = rect.top
  }
  return { x, y }
}

const blockGetEndCoordinates = (ref: InstanceType<typeof VueElement>) => {
  let x = 0, y = 0
  const lastChild = blockGetLastChild(ref)
  if (lastChild) {
    const range = document.createRange()
    range.selectNodeContents(lastChild.firstChild || lastChild)
    range.collapse()
    const rect = range.getBoundingClientRect()
    x = rect.left
    y = rect.top
  }
  return { x, y }
}

const blockSetCaretPos = (ref: InstanceType<typeof VueElement>, pos: number, node?: ChildNode | null) => {
  const {type, editor, container} = blockGetEditor(ref);
  const content = blockGetFirstChild(ref) || container;
  if (!content) {
    return;
  }

  if (editor) {
    let offsetNode;
    let offset = 0;

    const nodelist = editor ? container.firstChild?.childNodes || [] : container.childNodes || [];
    for (const [i, node] of nodelist.entries()) {
      if (offset + (node.textContent?.length || 0) as number > pos || i === nodelist.length - 1) {
        offsetNode = node
        break
      }
      offset += node.textContent?.length as number
      offsetNode = node
    }
    if (!offsetNode) {
      return;
    }

    const selection = window.getSelection()
    const range = document.createRange()
    range.setStart(node || (offsetNode.firstChild || offsetNode), pos - offset)
    range.setEnd(node || (offsetNode.firstChild || offsetNode), pos - offset)
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else {
    const selection = window.getSelection()
    const range = document.createRange()
    range.setStart(node || content, pos)
    range.setEnd(node || content, pos)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

const blockGetNewPos = (element: VueElement, pos: number) => {
  if (element.nodeType === Node.TEXT_NODE) {
    return pos > ((element as Node).textContent?.length || 0) ? (element as Node).textContent?.length ?? 0 : pos
  }
  const { container, editor } = blockGetEditor(element);
  if (editor) {
    element = (container.firstChild as VueElement)
  } else {
    element = (container as VueElement);
  }
  return pos > (element.textContent?.length ?? 0) ? element.textContent?.length ?? 0 : pos
}

const blockGetPrevBlock = (blocks: Block[], refs: Ref<VueElement[]>, index: number): {
  prevBlock: Block | false,
  prevBlockRef: VueElement | false,
} => {
  const block = blocks[index - 1];
  if (block === undefined) {
    return { prevBlock: false, prevBlockRef: false}
  } else if (contentBlocks.includes(block.type)) {
    return { prevBlock: block, prevBlockRef: refs.value[index - 1] }
  } else {
    return blockGetPrevBlock(blocks, refs, index - 1)
  }
}

const blockGetNextBlock = (blocks: Block[], refs: Ref<VueElement[]>, index: number): {
  nextBlock: Block | false,
  nextBlockRef: VueElement | false,
} => {
  const block = blocks[index + 1];
  if (block === undefined) {
    return { nextBlock: false, nextBlockRef: false}
  } else  if (contentBlocks.includes(block.type)) {
  return { nextBlock: block, nextBlockRef: refs.value[index + 1] }
  } else {
    return blockGetNextBlock(blocks, refs, index + 1)
  }
}

/**
 * Checks for commands
 * @param event 
 * @param block 
 */
const blockRenderMarkdown = (event: KeyboardEvent, block: Block, menus: BlockMenu) => {
  const content = block.properties.content;
  if (!content || content.length === 0 || ['Shift', 'Alt'].includes(event.key)) {
    if (!['Shift', 'Alt'].includes(event.key)) {
      menus.searchbar = false;
    }
    return;
  }

  if (menus.searchbar && !content.includes('/')) {
    menus.searchbar = false;
  }

  if (event.key === '/') {
    // Open menu
    menus.searchbar = true;
  } else if (event.key === ' ') {
    // Check if any patterns match
    for (const key in patterns) {
      const pattern = (patterns as any)[key];
      const match = content.match(pattern) 
      if (!match) {
        continue
      }
      block.properties.content = block.properties.content.replace(match.input || '', '')
      block.type = (key as Block["type"]);
    }
  }
}

const blockMarkdownToHTML = (string: string, patterns = {
  underline: /^__((?:\\[\s\S]|[^\\])+?)__(?!_)/,
  italics: /^\b_((?:__|\\[\s\S]|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\\[\s\S]|\s+(?:\\[\s\S]|[^\s\*\\]|\*\*)|[^\s\*\\])+?)\*(?!\*)/,
  bold: /^\*\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/,
  strikethrough: /^~~(?=\S)((?:\\[\s\S]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/, 
}) => {
  for (const key in patterns) {
    const pattern = (patterns as any)[key];
    const match = string.match(pattern)
    if (!match) {
      continue
    }
    let html = '';
    switch(key) {
      case 'italics':
        html = `<em>${match[2]}</em>`
        break;
      case 'bold':
        html = `<strong>${match[1]}</strong>`
        break;
      case 'underline':
        html = `<u>${match[1]}</u>`
        break;
      case 'strikethrough':
        html = `<del>${match[1]}</del>`
        break;
    }
    return string.replace(match.input || '', html);
  }
  return string
}

const blockHTMLtoMarkdown = (string: string) => {
  return string
    .replaceAll('<p>', '')
    .replaceAll('</p>', '')
    .replaceAll('<strong>', '**')
    .replaceAll('</strong>', '**')
    .replaceAll('<em>', '*')
    .replaceAll('</em>', '*')
    .replaceAll('<u>', '__')
    .replaceAll('</u>', '__')
    .replaceAll(/\<br.*?\>/g, '')
}

const blockSetProperties = (block: Block, type: Block["type"]) => {
  switch(type.replace(/\_\d*/, '')) {
    case 'table':
      block.properties.table = [
        [{content: '', width: 300}, {content: '', width: 300}],
        [{content: '', width: 300}, {content: '', width: 300}],
      ]
      break;
    case 'columns':
      const columnsAmount = parseInt(type.replace('columns_', ''))
      if (!columnsAmount) {
        return;
      }
      const arr = []
      for (let i = 0; i < columnsAmount; i++) {
        arr.push({content: ''})
      }
      block.properties.columns = arr;
      break;
  }
}

const blockKeyDownHandler = (
  event:KeyboardEvent,
  menus: BlockMenu,
  parent: string,
  emits: Function,
  content:InstanceType<typeof VueElement> | null | undefined,
  ref?: InstanceType<typeof VueElement>
) => {
  const block = ref ? ref : content;
  if (!block) {
    return;
  }
  switch(event.key) {
    case 'Enter':
      // If shift is used we just want to create a new line in current block
      if (menus.searchbar) {
        event.preventDefault();
      } else if (!event.shiftKey) {
        event.preventDefault();
        emits('block:insert', block, 'paragraph', parent)
      } 
      break;
    case 'Backspace':
      // If text hasnt been highlighted and pointer position is at start we remove the current block. If text remains it will be merged into "above" block
      if (!highlightedBlock() && blockCursorPosition(event.target as HTMLElement, 'start')) {
        event.preventDefault();
        event.stopPropagation();
        emits('block:remove', block)
      }
      break;
    case 'ArrowUp':
      if (menus.searchbar) {
        break;
      }
      // Alt + Arrowup should move block up
      if (event.altKey) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:position:up', block)
      // If at first line move to previous block
      } else if (blockAtFirstLine(block)) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:move:prev', block, 'ArrowUp')
      }
      break;
    case 'ArrowRight':
      // If at end of last line emit block:move:next
      if (blockAtLastChar(block)) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:move:next', block, 'ArrowRight')
      }
      break;
    case 'ArrowDown':
      // Alt + Arrowdown should move block down
      if (menus.searchbar) {
        break;
      }
      if (event.altKey) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:position:down', block)
      // If at last line move to next block
      } else if (blockAtLastLine(block)) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:move:next', block, 'ArrowDown')
      }
      break;
    case 'ArrowLeft':
      // If at start of first line emit block:move:prev
      if (blockAtFirstChar(block)) {
        event.stopPropagation();
        event.preventDefault();
        emits('block:move:prev', block, 'ArrowLeft')
      }
      break;
  }
};

// REPLACE IN CASE BACKEND ISNT NEEDED
const blockGetNewBlock = (type: Block["type"], parent?: Block["id"]): Block => {
  const socket = useSocket();
  useInternalFetch('/blocks', {
    method: 'POST',
    body: { type, parent, room: 'test' },
  })
}
