import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface CleanupResult {
  scannedCount: number;
  deletedCount: number;
  freedBytes: number;
  errors: string[];
}

/**
 * Scans the temporary upload directory and purges files older than maxAgeMinutes.
 * Protects server disk from accumulating orphaned uploads or abandoned jobs.
 */
export async function cleanStaleTempFiles(
  tempDir: string = path.join(os.tmpdir(), 'cms-temp-uploads'),
  maxAgeMinutes: number = Number(process.env.MEDIA_TEMP_RETENTION_MINUTES || 60)
): Promise<CleanupResult> {
  const result: CleanupResult = {
    scannedCount: 0,
    deletedCount: 0,
    freedBytes: 0,
    errors: [],
  };

  try {
    await fs.mkdir(tempDir, { recursive: true });
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;

    for (const file of files) {
      const fullPath = path.join(tempDir, file);
      result.scannedCount++;

      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isFile()) continue;

        const ageMs = now - stat.mtimeMs;
        if (ageMs > maxAgeMs) {
          const fileSize = stat.size;
          await fs.unlink(fullPath);
          result.deletedCount++;
          result.freedBytes += fileSize;
        }
      } catch (fileErr) {
        result.errors.push(`Failed to clean ${file}: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}`);
      }
    }
  } catch (dirErr) {
    result.errors.push(`Failed to access temp directory: ${dirErr instanceof Error ? dirErr.message : String(dirErr)}`);
  }

  return result;
}
