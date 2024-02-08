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
export const textBlocks = ['paragraph', 'quote', 'columns_2', 'columns_3', 'columns_4', 'columns_5']
const textBlockMarkdownTags = ['strong', 'em', 'u', 'del'];
export const contentBlocks = [
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

export const multiEdiorBlocks = [
  'table',
  'columns_2',
  'columns_3',
  'columns_4',
  'columns_5'
]

export const updateBlock = (blocks: Ref<Array<Block>>, { id, pageId, path, block }: UpdateBlock) => {
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
export const highlightedBlock = () => {
  return window.getSelection()?.toString().length
}

/**
 * Helper function for when checking cursor position.
 * @param node 
 * @param position 
 * @returns {Boolean}
 */
export const blockCursorPosition = (node: HTMLElement, position: 'start' | 'end') => {
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
export const blockGetFirstChild = (ref: InstanceType<typeof VueElement>) => {
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
export const blockGetLastChild = (ref: InstanceType<typeof VueElement>) => {
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

export const blockGetEditor = (ref: InstanceType<typeof VueElement>): {
  editor: boolean,
  type: Block["type"] | null,
  container: HTMLElement,
} => {
  const type = getType(ref);
  const editor = (function(){
    if ((ref as any).classList && (ref as any).classList.contains('block')) {
      const id = (ref as any).id;
      return (ref as any).querySelector(`#${id} > div.block-container .block-editor`);
    }
    return null;
  }());
  const container = (function(){
    if (editor) {
      return editor
    }
    // Is a block index.vue element
    if ((ref as any).classList && (ref as any).classList.contains('block')) {
      return (ref as any).querySelector('*[contenteditable]') || ref;
    } else if  ((ref as any).$el && (ref as any).$el.querySelector) {
      return (ref as any).$el.querySelector('*[contenteditable]') || (ref as any).$el;
    } else {
      return (ref as any).$el;
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

export const blockGetCaretPos = (ref: InstanceType<typeof VueElement>, includeTag: boolean = false) => {
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

export const blockGetCaretCoordinates = () => {
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

export const blockAtFirstChar = (ref: InstanceType<typeof VueElement>) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === startCoord.x && coord?.y === startCoord.y
}

export const blockAtLastChar = (ref: InstanceType<typeof VueElement>) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === endCoord.x && coord?.y === endCoord.y
}

export const blockAtFirstLine = (ref: InstanceType<typeof VueElement>) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === startCoord.y
}

export const blockAtLastLine = (ref: InstanceType<typeof VueElement>) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === endCoord.y
}

export const blockGetStartCoordinates = (ref: InstanceType<typeof VueElement>) => {
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

export const blockGetEndCoordinates = (ref: InstanceType<typeof VueElement>) => {
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

export const blockSetCaretPos = (ref: InstanceType<typeof VueElement>, caret: 'start' | 'end' | 'current', blockOverride?: HTMLElement) => {
  const {type, editor, container} = blockGetEditor(ref);

  let pos = 0;
  let content = container;
  switch(caret) {
    case 'start':
      content = blockGetFirstChild(ref) as HTMLElement;
      break;
    case 'end':
      content = blockGetLastChild(ref) as HTMLElement;
      pos = content.textContent?.length || 0;
      break;
    case 'current':
      content = blockGetFirstChild(ref) as HTMLElement;
      pos = blockGetCaretPos(blockOverride as VueElement || ref).pos;
      break;
  }

  if (pos > (content.textContent?.length || 0)) {
    pos = content.textContent?.length || 0;
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
    range.setStart(offsetNode.firstChild || offsetNode, pos - offset)
    range.setEnd(offsetNode.firstChild || offsetNode, pos - offset)
    selection?.removeAllRanges()
    selection?.addRange(range)
  } else {
    const selection = window.getSelection()
    const range = document.createRange()
    range.setStart(content, pos)
    range.setEnd(content, pos)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

export const blockSetProperties = (block: Block, type: Block["type"]) => {
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

export const blockResolvePath = (path: string[], block: Block): Block => {
  for (let i = 1; i < path.length; i++) {
    if (block) {
      block = block.content.find((block) => block.id === path[i]);
    }
  }
  if (!block) {
    throw createError('Couldnt find block')
  }
  return block
}


// REPLACE IN CASE BACKEND ISNT NEEDED
export const blockGetNewBlock = (type: Block["type"], parent?: Block["id"]): Block => {
  const socket = useSocket();
  useInternalFetch('/blocks', {
    method: 'POST',
    body: { type, parent, room: 'test' },
  })
}

/**
 * Checks for commands
 * @param event 
 * @param block 
 */
export const blockRenderMarkdown = (event: KeyboardEvent, block: Block, menus: BlockMenu) => {
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

export const blockMarkdownToHTML = (string: string, patterns = {
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

export const blockHTMLtoMarkdown = (string: string) => {
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
