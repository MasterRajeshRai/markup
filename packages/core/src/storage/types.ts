export interface UploadResult {
  path: string;
  publicUrl: string;
  size: number;
}

export interface StorageDriver {
  upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  delete(path: string): Promise<boolean>;
  getUrl(path: string): string;
}
