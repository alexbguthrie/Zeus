import { dialog, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { ImageSaveRequest } from '../shared/image-tool';
import { getAppWindow, isAppWindowSender } from './app-windows';

export async function saveResizedImage(
  event: IpcMainInvokeEvent,
  request: ImageSaveRequest,
): Promise<'saved' | 'cancelled'> {
  const resizeWindow = getAppWindow('resize-image');
  if (!isAppWindowSender(event, 'resize-image') || !resizeWindow)
    throw new Error('Unauthorized image save request.');
  if (
    !request ||
    !(request.bytes instanceof Uint8Array) ||
    !request.bytes.length ||
    request.bytes.length > 200 * 1024 * 1024
  )
    throw new Error('Invalid image data.');
  const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' } as const;
  if (!Object.hasOwn(extensions, request.format) || typeof request.name !== 'string')
    throw new Error('Invalid image format.');
  const bytes = Buffer.from(request.bytes);
  const isImage =
    request.format === 'image/png'
      ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : request.format === 'image/jpeg'
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!isImage) throw new Error('Invalid image data.');
  const extension = extensions[request.format];
  const name =
    path
      .basename(request.name)
      .replace(/[\x00-\x1f]/g, '')
      .slice(0, 180)
      .replace(/\.[^.]*$/, '') || 'resized-image';
  const result = await dialog.showSaveDialog(resizeWindow, {
    title: 'Save resized image',
    defaultPath: `${name}.${extension}`,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  });
  if (result.canceled || !result.filePath) return 'cancelled';
  await writeFile(result.filePath, bytes);
  return 'saved';
}
