import type { RequestHandler } from 'express';
import { wantsJson } from './http.ts';

/**
 * Guards routes that need a signed-in user.
 * JSON clients get a 401; classic browser navigations are redirected to /login (v1 behaviour).
 */
export const withAuth: RequestHandler = (req, res, next) => {
  if (req.session.logged_in && req.session.user_id) {
    next();
    return;
  }
  if (wantsJson(req)) {
    res.status(401).json({ message: 'Please log in to continue.' });
    return;
  }
  res.redirect(303, '/login');
};
