// Main tools appear in the Tools section and in launcher search.
export const mainTools = [{
  id: 'resize-image',
  title: 'Resize Image',
  description: 'Resize an image and save a new copy',
  keywords: 'photo picture dimensions scale png jpeg jpg webp',
  page: 'tools/main/resize-image/index.html',
}] as const;

export type MainTool = (typeof mainTools)[number];
