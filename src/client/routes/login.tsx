import { useEffect, useRef } from 'react';
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import { LIMITS } from '../../shared/types.ts';
import { Field } from '../components/Field.tsx';
import { PasswordField } from '../components/PasswordField.tsx';
import { api } from '../lib/api.ts';
import { toActionError } from '../lib/errors.ts';
import type { LoginActionData } from '../lib/types.ts';
import './login.css';

/** Only allow same-site relative redirects (no open redirect via ?next=). */
function safeNext(url: URL): string {
  const next = url.searchParams.get('next') ?? '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export async function loginLoader({ request }: LoaderFunctionArgs) {
  const me = await api.me(request.signal).catch(() => null);
  if (me?.loggedIn) throw redirect(safeNext(new URL(request.url)));
  return null;
}

export async function loginAction({
  request,
}: ActionFunctionArgs): Promise<LoginActionData | Response> {
  const form = await request.formData();
  const intent = form.get('intent') === 'signup' ? 'signup' : 'login';
  const get = (k: string) => String(form.get(k) ?? '');
  try {
    if (intent === 'signup') {
      await api.signup({
        username: get('username'),
        email: get('email'),
        password: get('password'),
      });
    } else {
      await api.login({ email: get('email'), password: get('password') });
    }
    return redirect(safeNext(new URL(request.url)));
  } catch (err) {
    return toActionError(intent, err);
  }
}

function useFocusOnError(data: LoginActionData | undefined, intent: 'login' | 'signup') {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data && !data.ok && data.intent === intent) ref.current?.focus();
  }, [data, intent]);
  return ref;
}

export function LoginRoute() {
  const data = useActionData() as LoginActionData | undefined;
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const submitting = navigation.state === 'submitting' ? navigation.formData?.get('intent') : null;
  const errorFor = (intent: 'login' | 'signup') =>
    data && !data.ok && data.intent === intent ? data : null;
  const loginErr = errorFor('login');
  const signupErr = errorFor('signup');
  const loginAlert = useFocusOnError(data, 'login');
  const signupAlert = useFocusOnError(data, 'signup');
  const action = `/login${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`;

  return (
    <>
      <title>Log in or sign up · Kiddin’</title>
      <div className="auth wrap">
        <div className="auth__head">
          <p className="eyebrow">Welcome back, legend</p>
          <h1 className="auth__title">Join the club</h1>
          <p className="auth__lede">
            {params.get('next')
              ? 'Log in to see that thread — or sign up in seconds.'
              : 'Log in to post, or create an account in seconds.'}
          </p>
        </div>

        <div className="auth__grid">
          <section className="auth__card card" data-tone="sky" aria-labelledby="login-title">
            <h2 id="login-title">Log in</h2>
            {loginErr && (
              <div ref={loginAlert} tabIndex={-1} role="alert" className="auth__alert">
                {loginErr.message}
              </div>
            )}
            <Form method="post" action={action} className="auth__form" noValidate={false}>
              <input type="hidden" name="intent" value="login" />
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                error={loginErr?.errors.email}
              />
              <PasswordField
                id="login-password"
                label="Password"
                name="password"
                autoComplete="current-password"
                error={loginErr?.errors.password}
              />
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={Boolean(submitting)}
              >
                {submitting === 'login' ? 'Logging in…' : 'Log in'}
              </button>
            </Form>
          </section>

          <section className="auth__card card" data-tone="pink" aria-labelledby="signup-title">
            <h2 id="signup-title">Sign up</h2>
            {signupErr && (
              <div ref={signupAlert} tabIndex={-1} role="alert" className="auth__alert">
                {signupErr.message}
              </div>
            )}
            <Form method="post" action={action} className="auth__form">
              <input type="hidden" name="intent" value="signup" />
              <Field
                label="Username"
                name="username"
                autoComplete="username"
                maxLength={LIMITS.usernameMax}
                hint="This is what other parents will see."
                error={signupErr?.errors.username}
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                error={signupErr?.errors.email}
              />
              <PasswordField
                id="signup-password"
                label="Password"
                name="password"
                autoComplete="new-password"
                minLength={LIMITS.passwordMin}
                hint={`At least ${LIMITS.passwordMin} characters.`}
                error={signupErr?.errors.password}
              />
              <button
                type="submit"
                className="btn btn--pink btn--block"
                disabled={Boolean(submitting)}
              >
                {submitting === 'signup' ? 'Creating account…' : 'Create account'}
              </button>
            </Form>
          </section>
        </div>
      </div>
    </>
  );
}
