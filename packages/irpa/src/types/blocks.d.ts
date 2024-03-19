type Block = {
  id: string,
  type:
    'heading_1' |
    'heading_2' |
    'heading_3' |
    'page' |
    'paragraph' |
    'to_do' |
    'bulleted_list' |
    'toggle_list' |
    'table' |
    'code' |
    'quote' |
    'toggle_heading_1' |
    'toggle_heading_2' |
    'toggle_heading_3' |
    'columns_2' |
    'columns_3' |
    'columns_4' |
    'columns_5',
  properties: {
    content: string,
    columns?: {
      content: string,
    }[],
    table?: {content: string, width: number}[][],
    [key: string]: string | number | boolean
  },
  content: Block[],
  parents: {
    [key: string]: string,
  }
}

interface BlockCopy extends Block {
  content: undefined,
}

interface BlockOrigin extends Block {
  id?: string,
}

interface UpdateBlock {
  pageId: string,
  path: string[],
  block: Block,
}

interface BlockMenu {
  searchbar: boolean,
  navigation: boolean,
}

export type {
  Block,
  BlockCopy,
  BlockOrigin,
  UpdateBlock,
  BlockMenu,
}
