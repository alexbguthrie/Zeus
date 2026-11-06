// Main tools appear in the Tools section and in launcher search.
export const tools = [
  {
    id: 'resize-image',
    title: 'Resize Image',
    description: 'Resize an image and save a new copy',
    keywords: 'photo picture dimensions scale png jpeg jpg webp',
    page: 'tools/resize-image/index.html',
  },
] as const;

export type Tool = (typeof tools)[number];
