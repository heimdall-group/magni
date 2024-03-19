import { Ref, VueElement } from "vue";
import type { Block, BlockCopy, BlockMenu, BlockOrigin, UpdateBlock } from "../types/blocks";

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
export const textBlocks: Block["type"][] = ['paragraph', 'quote', 'columns_2', 'columns_3', 'columns_4', 'columns_5']
const textBlockMarkdownTags = ['strong', 'em', 'u', 'del'];
export const contentBlocks: Block["type"][] = [
  'heading_1',
  'heading_2',
  'heading_3',
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


// [chore] Rewrite
export const updateBlock = (blocks: Ref<Array<Block>>, { id, pageId, path, block }: UpdateBlock) => {
  // Wtf is this pos function. Remake so it loops through path and actully able to nest down the path.
  const parent = blocks.value.find((blocks) => blocks.id === path[path.length - 2])
  if (!parent) {
    throw 'Couldnt find parent'
  }

  const target = parent.content.find((blocks) => typeof blocks !== 'string' ? blocks.id === block.id : false);
  if (!target) {
    throw 'Couldnt find target block'
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
    throw 'Couldnt find selection'
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
export const blockGetFirstChild = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const {editor, container} = blockGetEditor(ref);
  if (editor) {
    if (container.firstChild?.firstChild) {
      return container.firstChild?.firstChild
    } else if (container.firstChild) {
      return container.firstChild
    }
    return container;
  } else {
    return container.firstChild;
  }
}

// Returns last child of editor if its in textBlockTypes
export const blockGetLastChild = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const {editor, container} = blockGetEditor(ref);
  console.log(editor, container)
  if (editor) {
    console.log('if')
    if (container.firstChild?.lastChild?.childNodes?.length !== undefined && container.firstChild?.lastChild?.childNodes?.length > 0) {
      return container.firstChild?.lastChild.lastChild
    }
    return container.firstChild?.lastChild
  } else {
    console.log('else')
    return container.lastChild;
  }
}

export const blockGetEditor = (ref: InstanceType<typeof VueElement> | Element | HTMLElement): {
  editor: boolean,
  container: HTMLElement,
} => {
  // const editor = (function(){
  //   if ((ref as any).classList && (ref as any).classList.contains('block')) {
  //     console.log('if')
  //     const id = (ref as any).id;
  //     return (ref as any).querySelector(`#${id} > div.block-container .block-editor`);
  //   } else if ((ref as any).getAttribute && (ref as any).getAttribute('html') !== null) {
  //     console.log('else if')
  //     return ref;
  //   }
  //   return null;
  // }());
  // const container = (function(){
  //   if (editor) {
  //     return editor
  //   }
  //   // Is a block index.vue element
  //   if ((ref as any).classList && (ref as any).classList.contains('block')) {
  //     return (ref as any).querySelector('*[contenteditable]') || ref;
  //   } else if ((ref as any).getAttribute && (ref as any).getAttribute('contenteditable') !== null) {
  //     return ref;
  //   } else if  ((ref as any).$el && (ref as any).$el.querySelector) {
  //     return (ref as any).$el.querySelector('*[contenteditable]') || (ref as any).$el;
  //   } else {
  //     return (ref as any).$el;
  //   }
  // }())

  // Get Block type and check if it supports markdown return editor true
  // const block = (ref as any).$el ? (ref as any).$el.closest('.block') : ref.closest('.block');
  let block;  
  const node = (ref as any).$el ? (ref as any).$el : ref;
  if (node.classList && node.classList.contains('block')) {
    block = node;
  }
  block = node.closest('.block');

  const id = block?.id;
  if (!id) {
    throw 'Couldnt find block id'
  }

  const container = block.querySelector('*[contenteditable]');
  if (!container) {
    throw 'Couldnt find container'
  }

  return {
    editor: container.getAttribute('html') === true,
    container,
  };
};

export const blockGetCaretPos = (ref: InstanceType<typeof VueElement> | Element | HTMLElement, includeTag: boolean = false) => {
  const selection = window.getSelection()
  if (!selection || 
    ((selection.anchorNode as HTMLElement)?.classList &&
    (selection.anchorNode as HTMLElement)?.classList.contains('is-empty'))
  ) {
    return { pos: 0 };
  }
  
  let offset = 0
  let tag = null
  const {editor, container} = blockGetEditor(ref);
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

export const blockAtFirstChar = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === startCoord.x && coord?.y === startCoord.y
}

export const blockAtLastChar = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === endCoord.x && coord?.y === endCoord.y
}

export const blockAtFirstLine = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === startCoord.y
}

export const blockAtLastLine = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === endCoord.y
}

export const blockGetStartCoordinates = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
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

export const blockGetEndCoordinates = (ref: InstanceType<typeof VueElement> | Element | HTMLElement) => {
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

export const blockSetCaretPos = (
  ref: InstanceType<typeof VueElement> | Element | HTMLElement,
  caret: 'start' | 'end' | 'current' | 'override',
  currentRef?: InstanceType<typeof VueElement> | Element | HTMLElement,
) => {
  const {editor, container} = blockGetEditor(ref);
  let content = container;
  let pos = 0;
  switch(caret) {
    case 'start':
      content = blockGetFirstChild(ref) as HTMLElement;
      pos = 0;
      break;
    case 'end':
      content = blockGetLastChild(ref) as HTMLElement;
      pos = content.textContent?.length || 0;
      break;
    case 'current':
      content = blockGetFirstChild(ref) as HTMLElement;
      pos = blockGetCaretPos(currentRef || ref).pos;
      break;
    case 'override':
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
      offsetNode = content;
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
      block = block.content.find((block) => block.id === path[i]) || block;
    }
  }
  if (!block) {
    throw 'Couldnt find block'
  }
  return block
}

/**
 * Checks for commands
 * @param event 
 * @param block 
 */
export const blockHandleKeyUp = (event: KeyboardEvent, block: Block, menus: BlockMenu) => {
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

// Markdown to HTML
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
    // switch(key) {
    //   case 'italics':
    //     html = `<span class="block-italics">${match[2]}</span>\u200B`
    //     break;
    //   case 'bold':
    //     html = `<span class="block-bold">${match[1]}</span>\u200B`
    //     break;
    //   case 'underline':
    //     html = `<span class="block-underline">${match[1]}</span>\u200B`
    //     break;
    //   case 'strikethrough':
    //     html = `<span class="block-strikethrough">${match[1]}</span>\u200B`
    //     break;
    // }
    console.log(string)
    console.log(match)
    return string.replace(match[0] || '', html);
  }
  return string
}

// HTML to Markdown
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

export const blockExportAsMarkdown = (block: Block) => {
  switch(block.type) {
    case 'heading_1':
      return `# ${block.properties.content}`
    case 'heading_2':
      return `## ${block.properties.content}`
    case 'heading_3':
      return `### ${block.properties.content}`
    case 'page':
      return `[${block.properties.content}](/${block.id})`
    default:
      return block.properties.content
  }
}

export const blockImportMarkdown = (string: string, parent: Block["id"]): Block => {

}

export const blockInsertBlocks = (blocks: Block | Block[], parent: Block, index: number) => {
  if (!Array.isArray(blocks)) {
    blocks = [blocks]
  }
  parent.content.splice(index, 0, ...blocks)
}

export const blockRemoveBlocks = (blocks: Block | Block[], parent: Block, index: number) => {
  if (!Array.isArray(blocks)) {
    blocks = [blocks]
  }
  parent.content.splice(index, 1)
}

export const blockGetAllContent = (blocks: Block[]): BlockCopy[] => {
  const content: BlockCopy[] = [];
  blocks.forEach((block) => {
    content.push(Object.assign({}, block, {content: undefined}));
    if (block.content.length > 0) {
      const newContent = blockGetAllContent(block.content);
      newContent.forEach((block) => {
        if (!content.find((content) => content.id === block.id)) {
          content.push(block);
        }
      })
    }
  })
  return content;
}

export const blockNestBlocks = (blocks: Block[], paths: {[key: string]: string[]}, page: Block["id"]): Block[] => {
  blocks = blocks.sort((a, b) => paths[a.id].length - paths[b.id].length).reverse();
  blocks = blocks.map((block) => Object.assign({}, block, {content: []}));
  // Ids to filter out
  const ids: Block["id"][] = [];
  blocks.forEach((block) => {
    const parent = blocks.find((parent) => parent.id === block.parents[page]);
    if (parent) {
      parent.content = [...parent.content, block];
      ids.push(block.id);
    }
  })
  return blocks.filter((block) => !ids.includes(block.id));
}

// REPLACE IN CASE BACKEND ISNT NEEDED
export const blockGetNewBlock = (type: Block["type"], parent: Block["id"], page: Block["id"], blockOrigin?: BlockOrigin): Block => {
  const parentObj: {[key: string]: string} = {};
  parentObj[page] = parent;
  const block: Block = {
    // id: new ObjectId().toString(),
    id: new Date().getTime().toString(),
    type,
    parents: parentObj,
    properties: {
      content: '',
    },
    content: [],
  }

  switch(type) {
    case 'table':
      block.properties.table = [
        [{content: '', width: 300}, {content: '', width: 300}],
        [{content: '', width: 300}, {content: '', width: 300}],
      ]
      break;
    case 'columns_2':
      block.properties.columns = [{content: ''}, {content: ''}]
      break;
    case 'columns_3':
      block.properties.columns = [{content: ''}, {content: ''}, {content: ''}]
      break;
    case 'columns_4':
      block.properties.columns = [{content: ''}, {content: ''}, {content: ''}, {content: ''}]
      break;
    case 'columns_5':
      block.properties.columns = [{content: ''}, {content: ''}, {content: ''}, {content: ''}, {content: ''}]
      break;
  }

  if (blockOrigin) {
    const newOrigin = Object.assign({}, blockOrigin);
    delete newOrigin.id;
    Object.assign(block, newOrigin, {id: block.id, parents: parentObj});
  }
  return block;
}

export const blockGetSelectedBlock = (paths: {[key: string]: string[]}, block: Block): Block => {
  const selection = window.getSelection();
  const domBlock = (selection?.anchorNode?.parentElement as HTMLElement).closest('.block');
  const id = domBlock?.getAttribute('id')?.replace('block-', '');
  if (id) {
    return blockResolvePath(paths[id], block);
  } else {
    return block
  }
}

export const blockGetPrevBlock = (
  block: Block,
  paths: {[key: string]: string[]},
  page: Block,
  prevId?: Block["id"]
): Element | null => {
  if (prevId === block.id) {
    return document.querySelector(`#block-${block.id}`);
  }
  if (multiEdiorBlocks.includes(block.type)) {
    console.log('multiEditorBlocks', block.type)
    return document.querySelector(`#block-${block.id}`);
  } else {
    const parent = blockResolvePath(paths[block.parents[page.id]], page);
    const index = parent.content.indexOf(block);
    let prevBlock;
    if (index === 0) {
      // Go to parents parent
      prevBlock = blockResolvePath(paths[parent.parents[page.id]] || page.id, page);
      return blockGetPrevBlock(prevBlock, paths, page, prevBlock.id);
    } else {
      prevBlock = parent.content[index - 1];
      if (contentBlocks.includes(prevBlock.type)) {
        return document.querySelector(`#block-${prevBlock.id}`);
      } else {
        return blockGetPrevBlock(prevBlock, paths, page);
      }
    }
  }
}

export const blockGetNextBlock = (
  block: Block,
  paths: {[key: string]: string[]},
  page: Block,
): Element | null => {
  if (multiEdiorBlocks.includes(block.type)) {
    console.log('multiEditorBlocks', block.type)
    return document.querySelector(`#block-${block.id}`);
  } else {
    if (block.content.length > 0) {
      const nextBlock = block.content[0];
      if (contentBlocks.includes(nextBlock.type)) {
        return document.querySelector(`#block-${nextBlock.id}`);
      } else {
        return blockGetNextBlock(nextBlock, paths, page);
      }
    } else {
      const parent = blockResolvePath(paths[block.parents[page.id]], page);
      const index = parent.content.indexOf(block);
      let nextBlock;
      if (index === parent.content.length - 1) {
        // Go to parents parent
        nextBlock = blockResolvePath(paths[parent.parents[page.id]] || page.id, page);
        return blockGetNextBlock(nextBlock, paths, page);
      } else {
        nextBlock = parent.content[index + 1];
        if (contentBlocks.includes(nextBlock.type)) {
          return document.querySelector(`#block-${nextBlock.id}`);
        } else {
          return blockGetNextBlock(nextBlock, paths, page);
        }
      } 
    }
  }
}
