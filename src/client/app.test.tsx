import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { marketplace, signedIn, signedOut, threads } from './test/fixtures.ts';
import { expectNoAxeViolations } from './test/axe.ts';
import { renderApp, reply } from './test/render.tsx';

describe('home', () => {
  it('renders threads with a skip link, landmarks and a single h1, and passes axe', async () => {
    const { container } = renderApp('/', {
      'GET /api/users/me': signedOut,
      'GET /api/threads': threads,
    });
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      /Parenting is chaos/,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Buy and Sell Baby Stuff' })).toHaveAttribute(
      'href',
      '/thread/1',
    );
    expect(screen.getAllByText('Log in to join')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('greets a signed-in parent and offers log out', async () => {
    renderApp('/', { 'GET /api/users/me': signedIn, 'GET /api/threads': threads });
    expect(await screen.findByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(screen.getByText('Leo')).toBeInTheDocument();
    expect(screen.queryByText('Log in to join')).not.toBeInTheDocument();
  });
});

describe('login', () => {
  it('is accessible, supports password managers and reveals passwords on demand', async () => {
    const { container } = renderApp('/login', { 'GET /api/users/me': signedOut });
    const email = await screen.findAllByLabelText('Email address');
    expect(email[0]).toHaveAttribute('autocomplete', 'email');
    const pw = screen.getAllByLabelText('Password')[0]!;
    expect(pw).toHaveAttribute('type', 'password');
    expect(pw).toHaveAttribute('autocomplete', 'current-password');
    const toggle = screen.getAllByRole('button', { name: 'Show password' })[0]!;
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(pw).toHaveAttribute('type', 'text');
    await expectNoAxeViolations(container);
  });

  it('announces and focuses a login error', async () => {
    renderApp('/login', {
      'GET /api/users/me': signedOut,
      'POST /api/users/login': reply(401, {
        message: 'Incorrect email or password, please try again.',
      }),
    });
    const login = within(await screen.findByRole('region', { name: 'Log in' }));
    await userEvent.type(login.getByLabelText('Email address'), 'leo@leo.com');
    await userEvent.type(login.getByLabelText('Password'), 'nope-nope');
    await userEvent.click(login.getByRole('button', { name: 'Log in' }));
    const alert = await login.findByRole('alert');
    expect(alert).toHaveTextContent('Incorrect email or password');
    await waitFor(() => expect(alert).toHaveFocus());
  });

  it('shows field-level sign-up errors linked with aria-describedby', async () => {
    renderApp('/login', {
      'GET /api/users/me': signedOut,
      'POST /api/users': reply(409, {
        message: 'That email is already registered.',
        issues: [{ path: 'email', message: 'Already taken.' }],
      }),
    });
    const signup = within(await screen.findByRole('region', { name: 'Sign up' }));
    await userEvent.type(signup.getByLabelText('Username'), 'Sam');
    await userEvent.type(signup.getByLabelText('Email address'), 'leo@leo.com');
    await userEvent.type(signup.getByLabelText('Password'), 'longenough');
    await userEvent.click(signup.getByRole('button', { name: 'Create account' }));
    expect(await signup.findByRole('alert')).toHaveTextContent('already registered');
    const emailInput = signup.getByLabelText('Email address');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAccessibleDescription(/Already taken/);
  });
});

describe('thread', () => {
  it('redirects signed-out visitors to login with a return path', async () => {
    const { router } = renderApp('/thread/1', {
      'GET /api/users/me': signedOut,
      'GET /api/threads/1': reply(401, { message: 'Please log in to continue.' }),
    });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(router.state.location.search).toBe('?next=%2Fthread%2F1');
  });

  it('renders the marketplace with prices, a composer and own-post delete, and passes axe', async () => {
    const { container } = renderApp('/thread/1', {
      'GET /api/users/me': signedIn,
      'GET /api/threads/1': marketplace,
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Buy and Sell Baby Stuff' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Latest post')).toBeInTheDocument();
    expect(screen.getAllByText('$30.00').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^Price/)).toHaveAttribute('inputmode', 'decimal');
    expect(screen.getByRole('img', { name: 'A wooden balance bike' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo for “Nappies”' })).toBeInTheDocument();
    // Leo (id 2) can delete his own post only
    expect(screen.getAllByRole('button', { name: /^Delete/ })).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it('confirms before deleting in a modal dialog', async () => {
    let deleted = false;
    renderApp('/thread/1', {
      'GET /api/users/me': signedIn,
      'GET /api/threads/1': marketplace,
      'DELETE /api/posts/2': () => {
        deleted = true;
        return { body: 1 };
      },
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Delete “Balance Bike”' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete this post?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete post' }));
    await waitFor(() => expect(deleted).toBe(true));
    expect(await screen.findByText('Post deleted.')).toBeInTheDocument();
  });
});

describe('not found', () => {
  it('renders a friendly 404', async () => {
    renderApp('/nope', { 'GET /api/users/me': signedOut });
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'This page wandered off.',
    );
  });
});
