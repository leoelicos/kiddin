import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { del, put } from '@vercel/blob';
import multer from 'multer';
import sharp from 'sharp';
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../../shared/types.ts';
import { config } from '../config.ts';
import { HttpError } from './http.ts';

/** Where local-disk uploads are served (dev, tests, or no Blob token). */
export const PUBLIC_UPLOAD_PATH = '/data/uploads';

/** CSP img-src source for public Vercel Blob URLs. */
export const BLOB_IMG_SRC = 'https://*.public.blob.vercel-storage.com';

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

const accepted = new Set<string>(ACCEPTED_IMAGE_TYPES);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.uploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (accepted.has(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Please upload a JPG, PNG, WebP or AVIF image.'));
  },
});

/**
 * Normalises an uploaded photo: auto-rotates, caps it at 1600px, strips EXIF
 * (including GPS — these are photos of children) and encodes it as WebP.
 */
async function toWebp(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'That file could not be read as an image.');
  }
}

/**
 * Processes and stores a photo, returning its public URL: a Vercel Blob URL
 * when BLOB_READ_WRITE_TOKEN is set, otherwise a `/data/uploads/…` path.
 */
export async function saveImage(buffer: Buffer): Promise<string> {
  const webp = await toWebp(buffer);
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;

  if (config.blobToken) {
    const blob = await put(`uploads/${name}`, webp, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
      token: config.blobToken,
    });
    return blob.url;
  }

  await fs.mkdir(config.uploadDir, { recursive: true });
  await fs.writeFile(path.join(config.uploadDir, name), webp);
  return `${PUBLIC_UPLOAD_PATH}/${name}`;
}

/** True for URLs this app stored in Vercel Blob. */
export function isBlobUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * Best-effort removal of a stored photo after its post is deleted. Blob URLs
 * are deleted from Vercel Blob; local uploads are unlinked; anything else
 * (seeded `/images/…` assets, null) is left alone. Never throws.
 */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (isBlobUrl(url)) {
      if (config.blobToken) await del(url, { token: config.blobToken });
      return;
    }
    const prefix = `${PUBLIC_UPLOAD_PATH}/`;
    if (url.startsWith(prefix)) {
      const name = path.basename(url.slice(prefix.length));
      await fs.rm(path.join(config.uploadDir, name), { force: true });
    }
  } catch (error) {
    console.warn('[kiddin] Could not delete stored image:', error);
  }
}
