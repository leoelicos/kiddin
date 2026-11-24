import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user_id?: number;
    username?: string;
    logged_in?: boolean;
  }
}
