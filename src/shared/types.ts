/** Types shared by the API (src/server) and the web client (src/client). */

export interface SessionUser {
  id: number;
  username: string;
}

export interface SessionInfo {
  loggedIn: boolean;
  user: SessionUser | null;
}

export interface ThreadSummary {
  id: number;
  title: string;
  img: string;
  isMarketplace: boolean;
  postCount: number;
}

export interface PostDto {
  id: number;
  title: string;
  text: string;
  image_url: string | null;
  image_alt: string | null;
  price: number | null;
  date: string;
  thread_id: number;
  user_id: number;
  user: { username: string } | null;
  thread: { title: string } | null;
}

export interface ThreadDetail {
  thread: ThreadSummary;
  posts: PostDto[];
  isMarketplace: boolean;
}

export interface ApiErrorBody {
  message: string;
  issues?: Array<{ path: string; message: string }>;
}

/** The Marketplace thread is seeded first and keeps id 1 (unchanged from v1). */
export const MARKETPLACE_THREAD_ID = 1;

export const LIMITS = {
  titleMax: 100,
  textMax: 255,
  altMax: 200,
  passwordMin: 8,
  usernameMax: 40,
  uploadBytes: 8 * 1024 * 1024,
} as const;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;
