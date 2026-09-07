import type {
  RichTextBlock,
  RichTextElement,
  RichTextValue,
  TextStyle,
} from './types';

function applyStyle(text: string, style: TextStyle): string {
  let styled = text;
  if (style.code) styled = `\`${styled}\``;
  if (style.bold) styled = `*${styled}*`;
  if (style.italic) styled = `_${styled}_`;
  if (style.strike) styled = `~${styled}~`;
  return styled;
}

function elementToMrkdwn(element: RichTextElement): string {
  switch (element.type) {
    case 'link':
      return element.text ? `<${element.url}|${element.text}>` : `<${element.url}>`;
    case 'user':
      return `<@${element.user_id}>`;
    case 'emoji':
      return `:${element.name}:`;
    case 'text':
      return applyStyle(element.text ?? '', element.style ?? {});
    default:
      return '';
  }
}

function elementsToMrkdwn(elements: RichTextElement[] = []): string {
  return elements.map(elementToMrkdwn).join('');
}

function listToLines(block: Extract<RichTextBlock, { type: 'rich_text_list' }>): string[] {
  const isOrdered = block.style === 'ordered';
  return (block.elements ?? []).map((item, index) => {
    const prefix = isOrdered ? `${index + 1}. ` : '- ';
    return prefix + elementsToMrkdwn(item.elements);
  });
}

function blockToLines(block: RichTextBlock): string[] {
  switch (block.type) {
    case 'rich_text_section':
      return [elementsToMrkdwn(block.elements)];
    case 'rich_text_list':
      return listToLines(block);
    case 'rich_text_quote':
      return [`> ${elementsToMrkdwn(block.elements)}`];
    case 'rich_text_preformatted':
      return [`\`\`\`${elementsToMrkdwn(block.elements)}\`\`\``];
    default:
      return [];
  }
}

export function richTextToMrkdwn(value: RichTextValue | undefined): string {
  return (value?.elements ?? []).flatMap(blockToLines).join('\n');
}
