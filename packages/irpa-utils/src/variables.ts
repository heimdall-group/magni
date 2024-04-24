import { Block } from "irpa-types";

export const htmlTranslations = {
  'em': '*',
  'strong': '**',
  'del': '~~',
  'u': '__'
}

export const mdPatterns = {
  underline: /[\0]*\_{2}([^_]+)\_{2}/g,
  italics: /(?<!\*)[\0]*\*{1}([^*]+)\*{1}/g,
  bold: /[\0]*\*{2}([^*]+)\*{2}/g,
  strikethrough: /[\0]*\~{2}([^~]+)\~{2}/g, 
}

// Make sure the order of these are correct. 
export const shortcutPattern = {
  heading_1: /^#\s(.*)$/,
  heading_2: /^##\s(.*)$/,
  heading_3: /^###\s(.*)$/,
  heading_4: /^####\s(.*)$/,
  heading_5: /^#####\s(.*)$/,
  quote: /^>\s(.*)$/,
}

// Only object using editor. Other blocks will not include editor since they dont support markdown.
export const textBlocks: Block["type"][] = ['paragraph', 'quote', 'columns_2', 'columns_3', 'columns_4', 'columns_5']
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
