export interface ImageSaveRequest {
  bytes: Uint8Array;
  name: string;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}
export interface ImageToolBridge {
  saveCopy(request: ImageSaveRequest): Promise<'saved' | 'cancelled'>;
}
