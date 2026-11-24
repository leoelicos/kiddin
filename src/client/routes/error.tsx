import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import './error.css';

export function ErrorView({ status, message }: { status: number | string; message: string }) {
  return (
    <div className="error-page wrap">
      <title>{`${status === 404 ? 'Not found' : 'Oops'} · Kiddin’`}</title>
      <p className="error-page__code" aria-hidden="true">
        {status}
      </p>
      <h1 className="error-page__title">
        {status === 404 ? 'This page wandered off.' : 'Something spilled.'}
      </h1>
      <p className="error-page__msg">{message}</p>
      <Link to="/" className="btn btn--primary btn--lg">
        Back to threads
      </Link>
    </div>
  );
}

export function RouteError() {
  const err = useRouteError();
  if (isRouteErrorResponse(err)) {
    return (
      <ErrorView
        status={err.status}
        message={
          err.status === 404 ? 'Like a lost sock, we can’t find it anywhere.' : err.statusText
        }
      />
    );
  }
  return <ErrorView status="Oops" message="An unexpected error happened. Please try again." />;
}

export function NotFoundRoute() {
  return <ErrorView status={404} message="Like a lost sock, we can’t find it anywhere." />;
}
