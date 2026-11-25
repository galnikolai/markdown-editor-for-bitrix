import type { IImgWithCopyRight } from "../MDXComponents/ImageWithCopyRight";

export const sanitizeQuotesForMdx = (value: string): string =>
  value.replace(/"/g, "'");

export const sanitizeImgWithCopyRight = (
  item: IImgWithCopyRight
): IImgWithCopyRight => ({
  ...item,
  img: {
    ...item.img,
    alt: item.img.alt ? sanitizeQuotesForMdx(item.img.alt) : item.img.alt,
  },
  copyright: item.copyright
    ? sanitizeQuotesForMdx(item.copyright)
    : item.copyright,
});

export const serializeSwiperObjects = (arr: IImgWithCopyRight[]): string =>
  JSON.stringify(arr.map(sanitizeImgWithCopyRight));

export const parseSwiperObjects = (valueString: string): IImgWithCopyRight[] => {
  try {
    const parsed = JSON.parse(valueString);
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeImgWithCopyRight);
    }
    return [];
  } catch {
    const fixedJsonString = valueString
      .replace(/"(\w+)":/g, '"$1":')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      .replace(/"(https?):"/g, "$1:")
      .replace(/:\s*"/g, ': "');

    const parsed = JSON.parse(fixedJsonString);
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeImgWithCopyRight);
    }
    return [];
  }
};

export function generateRandomId(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
  
    return result;
  }
export const parseMarkdownToBlocks = (markdown: string): any[] => {
    const lines = markdown.split('\n');
    const blocks: any[] = [];

    let currentBlock: string[] = [];

    lines.forEach((line) => {
        if (line.trim() === '' && currentBlock.length > 0) {
            // Сохраняем текущий блок
            blocks.push({
                type: 'paragraph',
                content: currentBlock.join('\n')
            });
            currentBlock = [];
        } else if (line.trim() !== '') {
            currentBlock.push(line);
        }
    });

    if (currentBlock.length > 0) {
        blocks.push({
            type: 'paragraph',
            content: currentBlock.join('\n')
        });
    }

    return blocks;
};

export const insertMarkdownAtPosition = (
    original: string,
    toInsert: string,
    position: number
): string => {
    const lines = original.split('\n');
    lines.splice(position, 0, toInsert);
    return lines.join('\n');
};