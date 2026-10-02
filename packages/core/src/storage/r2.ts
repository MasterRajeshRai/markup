import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { generateR2StorageKey } from '../media/naming';

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicUrl?: string; // e.g. https://media.yourdomain.com or https://pub-xxx.r2.dev
  mockDir?: string;   // For local mock fallback when R2 credentials are not provided
}

export interface R2UploadResult {
  key: string;
  publicUrl: string;
  size: number;
  etag?: string;
  provider: 'cloudflare_r2' | 'r2_local_mock';
}

export class CloudflareR2Storage {
  private client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;
  private isMock: boolean = false;
  private mockDir: string;

  constructor(config: R2Config = {}) {
    const accountId = config.accountId || process.env.R2_ACCOUNT_ID;
    const accessKeyId = config.accessKeyId || process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = config.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = config.bucketName || process.env.R2_BUCKET_NAME || 'headless-cms-media';
    this.publicUrl = (config.publicUrl || process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
    this.mockDir = config.mockDir || path.resolve(process.cwd(), 'uploads/r2-mock');

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isMock = false;
    } else {
      // Graceful local mock mode for development/testing without live Cloudflare credentials
      this.isMock = true;
    }
  }

  public isMockMode(): boolean {
    return this.isMock;
  }

  public getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Generates a standard partitioned storage key:
   * media/sites/{siteId}/images/{year}/{month}/{seoName}/{seoName}-{presetSlug}-r2-{referenceId}.webp
   * Keeps SEO-friendly image name first, followed by Cloudflare R2 friendly reference name at last.
   */
  public generateKey(siteId: string, mediaId: string, presetSlug: string, format = 'webp', seoName?: string): string {
    return generateR2StorageKey({
      siteId,
      mediaId,
      presetSlug,
      seoName,
      format,
    });
  }

  /**
   * Resolves the public CDN / worker URL for a given storage key.
   */
  public getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    if (this.isMock) {
      return `/api/v1/media/mock-r2/${key}`;
    }
    // Default R2 dev public URL pattern if no custom domain configured
    return `https://${this.bucketName}.r2.dev/${key}`;
  }

  /**
   * Uploads a buffer directly to Cloudflare R2 with cache headers.
   */
  async upload(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/webp'
  ): Promise<R2UploadResult> {
    if (this.isMock || !this.client) {
      const fullPath = path.join(this.mockDir, key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, buffer);

      return {
        key,
        publicUrl: this.getPublicUrl(key),
        size: buffer.length,
        provider: 'r2_local_mock',
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    const response = await this.client.send(command);

    return {
      key,
      publicUrl: this.getPublicUrl(key),
      size: buffer.length,
      etag: response.ETag,
      provider: 'cloudflare_r2',
    };
  }

  /**
   * Verifies an uploaded asset exists in R2 and returns its size.
   */
  async verifyUpload(key: string): Promise<boolean> {
    if (this.isMock || !this.client) {
      try {
        const fullPath = path.join(this.mockDir, key);
        const stat = await fs.stat(fullPath);
        return stat.isFile() && stat.size > 0;
      } catch {
        return false;
      }
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.client.send(command);
      return response.ContentLength !== undefined && response.ContentLength > 0;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a single object from R2.
   */
  async delete(key: string): Promise<boolean> {
    if (this.isMock || !this.client) {
      try {
        const fullPath = path.join(this.mockDir, key);
        await fs.unlink(fullPath);
        return true;
      } catch {
        return false;
      }
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch deletes multiple objects from R2.
   * Crucial for atomic compensating rollbacks when any variant upload fails.
   */
  async deleteMany(keys: string[]): Promise<boolean> {
    if (!keys.length) return true;

    if (this.isMock || !this.client) {
      await Promise.all(
        keys.map(async (key) => {
          try {
            await fs.unlink(path.join(this.mockDir, key));
          } catch {
            // Ignore missing files in rollback
          }
        })
      );
      return true;
    }

    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
