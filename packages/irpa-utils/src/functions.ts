import { contentBlocks, htmlTranslations, mdPatterns, multiEdiorBlocks, shortcutPattern } from './variables'
import type { Block, BlockCopy, BlockMenu, BlockOrigin, UpdateBlock } from "irpa-types";
import { nextTick } from 'vue';

// Markdown to HTML
export const blockMarkdownToHTML = (string: string, patterns = mdPatterns) => {
  for (const key in patterns) {
    const pattern = (patterns as any)[key];
    // const match = string.match(pattern)
    const amountOfMatches = string.match(pattern) || [];
    for (let i = 0; i < amountOfMatches.length; i++) {      
      const match = pattern.exec(string)
      if (!match) {
        continue
      }
      let html = '';
      switch(key) {
        case 'italics':
          html = `<em>${match[1]}</em>`
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
      string = string.replace(match[0] || '', html);
    }
  }
  return string
}

// HTML to Markdown
export const blockHTMLtoMarkdown = (string: string, patterns = htmlTranslations) => {
  for (const key in patterns) {
    string = string.replace(`<${key}>`, (patterns as any)[key])
    string = string.replace(`</${key}>`, (patterns as any)[key])
  }
  return string
}

export const blockGetCaretPos = (ref: Element | HTMLElement, tag: 'none' | 'markdown' | 'html' = 'none'): number => {
  const { container } = blockGetEditor(ref);
  const selection = window.getSelection()
  if (!selection || 
    ((selection.anchorNode as HTMLElement)?.classList &&
    (selection.anchorNode as HTMLElement)?.classList.contains('is-empty'))
  ) {
    return 0;
  }
  let offset = 0
  const nodelist = container.childNodes;
  for (let i = 0; i < nodelist.length; i++) {
    const node = nodelist[i] as HTMLElement;
    if (node === selection.anchorNode || node === selection.anchorNode?.parentNode) {
      if (['strong', 'em', 'u', 'del'].includes((node.tagName || '').toLowerCase()) && tag !== 'none') {
        if (tag === 'html') {
          offset += node.tagName.toLowerCase().length + 2;
        } else if (tag === 'markdown') {
          offset += (htmlTranslations[node.tagName.toLowerCase() as keyof typeof htmlTranslations] || '').length;
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
  const { anchorOffset, focusOffset } = selection
  const selectionOffset = anchorOffset > focusOffset ? anchorOffset : focusOffset;
  return offset + selectionOffset
}

export const blockSetCaretPos = (
  node: Element | HTMLElement,
  pos: number,
) => {
  const { container } = blockGetEditor(node);
  let target = container;
  let offset = 0;
  if (pos > container.innerText.length) {
    pos = container.innerText.length;
  }

  const children = container.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    if (child.textContent && child.textContent?.length + offset > pos || i === children.length - 1) {
      target = child
      break
    }
    offset += child.textContent?.length || 0;
    target = child
  }

  if (target.textContent && (pos - offset) > target.textContent.length) {
    offset = target.textContent.length;
  }
  const selection = window.getSelection();
  const range = document.createRange();
  if (selection && range) {
    range.setStart(target.firstChild || target, (pos - offset))
    range.setEnd(target.firstChild || target, (pos - offset))
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export const blockGetEndPos = (ref: Element | HTMLElement) => {
  const { container } = blockGetEditor(ref);
  return container.innerText.length
}

export const blockIsTextHighlighted = () => {
  return window.getSelection()?.toString().length
}

// Returns first child of editor if its in textBlockTypes
export const blockGetFirstChild = (ref: Element | HTMLElement) => {
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
export const blockGetLastChild = (ref: Element | HTMLElement) => {
  const {editor, container} = blockGetEditor(ref);
  if (editor) {
    if (container.lastChild?.lastChild) {
      return container.lastChild.lastChild
    } else if (container.lastChild) {
      return container.lastChild
    }
    return container;
  } else {
    return container.lastChild;
  }
}

export const blockGetEditor = (ref: Element | HTMLElement): {
  editor: boolean,
  container: HTMLElement,
} => {
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
    editor: container.getAttribute('html') == 'true',
    container,
  };
};

export const blockGetCaretCoordinates = () => {
  let x = 0;
  let y = 0;
  const selection = window.getSelection()
  const range = selection?.getRangeAt(0)
  if((selection?.rangeCount as number) === 0 || !range) {
    return { x, y };
  }
  const rect = range?.getBoundingClientRect()
  return rect
}

// Broken
export const blockAtFirstChar = (ref: Element | HTMLElement) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === startCoord.x && coord?.y === startCoord.y
}

// Broken
export const blockAtLastChar = (ref: Element | HTMLElement) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.x === endCoord.x && coord?.y === endCoord.y
}

export const blockAtFirstLine = (ref: Element | HTMLElement) => {
  const startCoord = blockGetStartCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === startCoord.y
}

export const blockAtLastLine = (ref: Element | HTMLElement) => {
  const endCoord = blockGetEndCoordinates(ref)
  const coord = blockGetCaretCoordinates()
  return coord?.y === endCoord.y
}

export const blockGetStartCoordinates = (ref: Element | HTMLElement) => {
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

export const blockGetEndCoordinates = (ref: Element | HTMLElement) => {
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
    for (const key in shortcutPattern) {
      const pattern = (shortcutPattern as any)[key];
      const match = content.match(pattern) 
      if (!match) {
        continue
      }
      block.properties.content = block.properties.content.replace(match.input || '', '')
      block.type = (key as Block["type"]);
      nextTick(() => {
        const node = document.querySelector(`#block-${block.id}`);
        if (node) {
          const { container } = blockGetEditor(node);
          container.focus();
        }
      })
    }
  }
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

export const blockRemoveBlock = (parent: Block, block: Block) => {
  const index = parent.content.indexOf(block);
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
    id: `${new Date().getTime().toString()}-${Math.floor(Math.random() * 1000)}`,
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
): HTMLElement | null => {
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
): HTMLElement | null => {
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
        // Last index in parent
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
