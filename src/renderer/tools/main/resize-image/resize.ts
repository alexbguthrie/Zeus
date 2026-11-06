export const MAX_EDGE = 8192;
export const MAX_PIXELS = 40_000_000;
export type Format = 'image/png' | 'image/jpeg' | 'image/webp';
export function validDimensions(width: number, height: number) {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 && width <= MAX_EDGE && height <= MAX_EDGE && width * height <= MAX_PIXELS;
}
export function outputName(name: string, width: number, height: number, format: Format) {
  return `${name.replace(/\.[^.]+$/, '') || 'image'}-${width}x${height}.${format === 'image/jpeg' ? 'jpg' : format.split('/')[1]}`;
}
export async function resizeImage(source: ImageBitmap, width: number, height: number, format: Format, quality: number): Promise<Blob> {
  if (!validDimensions(width, height)) throw new Error('Use dimensions from 1–8192 px, up to 40 megapixels.');
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable.');
    if (format === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height); }
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
    if (!blob || blob.type !== format) throw new Error('Could not create this format. Try PNG.');
    return blob;
  } finally { canvas.width = 0; canvas.height = 0; }
}
