export type ActionResult<Intent extends string> =
  | { ok: true; intent: Intent; id?: number }
  | { ok: false; intent: Intent; message: string; errors: Record<string, string> };

export type ThreadActionData = ActionResult<'create' | 'delete'>;
export type LoginActionData = ActionResult<'login' | 'signup'>;
