import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';
import type { ApiErrorBody } from '../../shared/types.ts';

export class HttpError extends Error {
  readonly status: number;
  readonly issues: ApiErrorBody['issues'];
  constructor(status: number, message: string, issues?: ApiErrorBody['issues']) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

/** Parse with zod and turn failures into a 400 with field-level issues. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(
      400,
      'Please check the highlighted fields.',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }
  return result.data;
}

/** True when the client asked for JSON (fetch) rather than a classic HTML form post. */
export const wantsJson: (req: Parameters<RequestHandler>[0]) => boolean = (req) =>
  req.accepts(['html', 'json']) === 'json' || req.xhr;

export const notFoundApi: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Not found' } satisfies ApiErrorBody);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res
      .status(err.status)
      .json({ message: err.message, issues: err.issues } satisfies ApiErrorBody);
    return;
  }
  // Sequelize unique-constraint / validation errors are user errors, not 500s.
  const name = (err as { name?: string }).name;
  if (name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({ message: 'That email is already registered.' } satisfies ApiErrorBody);
    return;
  }
  if (name === 'SequelizeValidationError') {
    res
      .status(400)
      .json({ message: 'Please check the highlighted fields.' } satisfies ApiErrorBody);
    return;
  }
  if (name === 'MulterError') {
    res.status(400).json({ message: (err as Error).message } satisfies ApiErrorBody);
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side.' } satisfies ApiErrorBody);
};
