import type {
  ApiErrorBody,
  PostDto,
  SessionInfo,
  SessionUser,
  ThreadDetail,
  ThreadSummary,
} from '../../shared/types.ts';

export class ApiError extends Error {
  readonly status: number;
  readonly issues: NonNullable<ApiErrorBody['issues']>;
  constructor(status: number, body: Partial<ApiErrorBody>) {
    super(body.message ?? `Request failed (${status})`);
    this.status = status;
    this.issues = body.issues ?? [];
  }
  /** Field → first message, for inline form errors. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const i of this.issues) out[i.path] ??= i.message;
    return out;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');

  const res = await fetch(path, { credentials: 'same-origin', ...init, headers });
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body as Partial<ApiErrorBody>);
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export const api = {
  me: (signal?: AbortSignal) => request<SessionInfo>('/api/users/me', { signal }),
  login: (body: { email: string; password: string }) =>
    request<{ loggedInMessage: string; user: SessionUser }>('/api/users/login', {
      method: 'POST',
      body: json(body),
    }),
  signup: (body: { username: string; email: string; password: string }) =>
    request<SessionUser>('/api/users', { method: 'POST', body: json(body) }),
  logout: () => request<void>('/api/users/logout', { method: 'POST' }),
  threads: (signal?: AbortSignal) => request<ThreadSummary[]>('/api/threads', { signal }),
  thread: (id: string, signal?: AbortSignal) =>
    request<ThreadDetail>(`/api/threads/${encodeURIComponent(id)}`, { signal }),
  createPost: (form: FormData) =>
    request<PostDto>('/api/posts/uploads', { method: 'POST', body: form }),
  deletePost: (id: string | number) =>
    request<number>(`/api/posts/${encodeURIComponent(String(id))}`, { method: 'DELETE' }),
};
