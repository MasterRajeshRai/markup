import fs from 'fs/promises';
import path from 'path';
import type { StorageDriver, UploadResult } from './types';

export interface LocalStorageConfig {
  uploadDir: string;
  publicPathPrefix: string;
}

export class LocalStorageDriver implements StorageDriver {
  private uploadDir: string;
  private publicPathPrefix: string;

  constructor(config: LocalStorageConfig) {
    this.uploadDir = config.uploadDir;
    this.publicPathPrefix = config.publicPathPrefix.replace(/\/+$/, '');
  }

  async upload(fileBuffer: Buffer, filename: string, _mimeType: string): Promise<UploadResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Store in YYYY/MM subdirectories for scalability
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(this.uploadDir, yearMonth);
    await fs.mkdir(targetDir, { recursive: true });

    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}_${sanitized}`;
    const filePath = path.join(targetDir, uniqueFilename);

    await fs.writeFile(filePath, fileBuffer);

    const relativePath = `${yearMonth}/${uniqueFilename}`;
    const publicUrl = `${this.publicPathPrefix}/${relativePath}`;

    return {
      path: relativePath,
      publicUrl,
      size: fileBuffer.length,
    };
  }

  async delete(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, relativePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(relativePath: string): string {
    return `${this.publicPathPrefix}/${relativePath}`;
  }
}
