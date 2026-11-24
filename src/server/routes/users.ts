import { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { LIMITS, type SessionInfo } from '../../shared/types.ts';
import { config } from '../config.ts';
import { HttpError, parse } from '../lib/http.ts';
import { User } from '../models/index.ts';

export const usersRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isTest ? 1000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

const email = z.email({ error: 'Enter a valid email address.' }).trim().toLowerCase();

const SignupBody = z.object({
  username: z
    .string()
    .trim()
    .min(1, { error: 'Choose a username.' })
    .max(LIMITS.usernameMax, { error: `Usernames are ${LIMITS.usernameMax} characters max.` }),
  email,
  password: z
    .string()
    .min(LIMITS.passwordMin, { error: `Passwords need at least ${LIMITS.passwordMin} characters.` })
    .max(255),
});

const LoginBody = z.object({
  email,
  password: z.string().min(1, { error: 'Enter your password.' }),
});

/** Regenerate the session id on privilege change to prevent session fixation. */
function signIn(req: Request, user: User) {
  return new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user_id = user.id;
      req.session.username = user.username;
      req.session.logged_in = true;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

/** GET /api/users/me — who is signed in (new in v2). */
usersRouter.get('/me', (req, res) => {
  const { logged_in, user_id, username } = req.session;
  const body: SessionInfo =
    logged_in && user_id
      ? { loggedIn: true, user: { id: user_id, username: username ?? '' } }
      : { loggedIn: false, user: null };
  res.json(body);
});

/** POST /api/users — sign up (v1-compatible). */
usersRouter.post('/', authLimiter, async (req, res) => {
  const data = parse(SignupBody, req.body);
  const user = await User.create(data);
  await signIn(req, user);
  res.status(200).json(user.toPublic());
});

/** POST /api/users/login — v1-compatible success body. */
usersRouter.post('/login', authLimiter, async (req, res) => {
  const { email: address, password } = parse(LoginBody, req.body);
  const user = await User.findOne({ where: { email: address } });
  // Same response for unknown email and wrong password: no account enumeration.
  if (!user || !(await user.checkPassword(password))) {
    throw new HttpError(401, 'Incorrect email or password, please try again.');
  }
  await signIn(req, user);
  res.status(200).json({ loggedInMessage: 'You are now logged in!', user: user.toPublic() });
});

/** POST /api/users/logout — 204 when signed in, 404 otherwise (v1-compatible). */
usersRouter.post('/logout', (req, res, next) => {
  if (!req.session.logged_in) {
    res.status(404).end();
    return;
  }
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('kiddin.sid');
    res.status(204).end();
  });
});
