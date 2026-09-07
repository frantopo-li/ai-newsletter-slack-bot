export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
}

export type RichTextElement =
  | { type: 'text'; text?: string; style?: TextStyle }
  | { type: 'link'; url: string; text?: string }
  | { type: 'user'; user_id: string }
  | { type: 'emoji'; name: string };

export interface RichTextSection {
  type: 'rich_text_section';
  elements?: RichTextElement[];
}

export interface RichTextList {
  type: 'rich_text_list';
  style?: 'ordered' | 'bullet';
  elements?: RichTextSection[];
}

export interface RichTextQuote {
  type: 'rich_text_quote';
  elements?: RichTextElement[];
}

export interface RichTextPreformatted {
  type: 'rich_text_preformatted';
  elements?: RichTextElement[];
}

export type RichTextBlock =
  | RichTextSection
  | RichTextList
  | RichTextQuote
  | RichTextPreformatted;

export interface RichTextValue {
  elements?: RichTextBlock[];
}
