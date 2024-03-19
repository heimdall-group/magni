export const htmlToMarkdown = {
  'em': '*',
  'strong': '**',
  'del': '~~',
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

export const createEditor = () => {

}

export const blockGetCaretPos = (ref: Element | HTMLElement, tag: 'none' | 'markdown' | 'html' = 'none', selectionOffset: 'anchorOffset' | 'focusOffset' = 'anchorOffset'): number => {
  const selection = window.getSelection()
  if (!selection || 
    ((selection.anchorNode as HTMLElement)?.classList &&
    (selection.anchorNode as HTMLElement)?.classList.contains('is-empty'))
  ) {
    return 0;
  }
  let offset = 0
  const nodelist = ref.childNodes;
  for (let i = 0; i < nodelist.length; i++) {
    const node = nodelist[i] as HTMLElement;
    if (node === selection.anchorNode || node === selection.anchorNode?.parentNode) {
      if (['strong', 'em', 'u', 'del'].includes((node.tagName || '').toLowerCase()) && tag !== 'none') {
        if (tag === 'html') {
          offset += node.tagName.toLowerCase().length + 2;
        } else if (tag === 'markdown') {
          offset += (htmlToMarkdown[node.tagName.toLowerCase() as keyof typeof htmlToMarkdown] || '').length;
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

  return offset + selection[selectionOffset]
}
