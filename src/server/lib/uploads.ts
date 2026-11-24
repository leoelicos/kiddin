import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../../shared/types.ts';
import { config } from '../config.ts';
import { HttpError } from './http.ts';

export const PUBLIC_UPLOAD_PATH = '/data/uploads';

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
 * (including GPS — these are photos of children) and stores it as WebP.
 * Returns the public URL.
 */
export async function saveImage(buffer: Buffer): Promise<string> {
  await fs.mkdir(config.uploadDir, { recursive: true });
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
  try {
    await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(config.uploadDir, name));
  } catch {
    throw new HttpError(400, 'That file could not be read as an image.');
  }
  return `${PUBLIC_UPLOAD_PATH}/${name}`;
}
