import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectAccessible(page: Page) {
  // Let entrance animations settle so axe measures final colours.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(
    violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

async function logIn(page: Page) {
  await page.goto('/login');
  const form = page.getByRole('region', { name: 'Log in' });
  await form.getByLabel('Email address').fill('leo@leo.com');
  await form.getByLabel('Password').fill('leoiscool');
  await form.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test('home has no WCAG 2.2 AA violations', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectAccessible(page);
      await page.screenshot({
        path: `e2e-screens/home-${scheme}-${test.info().project.name}.png`,
        fullPage: true,
      });
    });

    test('login has no WCAG 2.2 AA violations', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { level: 1, name: 'Join the club' })).toBeVisible();
      await expectAccessible(page);
      await page.screenshot({
        path: `e2e-screens/login-${scheme}-${test.info().project.name}.png`,
        fullPage: true,
      });
    });

    test('thread has no WCAG 2.2 AA violations', async ({ page }) => {
      await logIn(page);
      await page.goto('/thread/1');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Buy and Sell Baby Stuff');
      await expectAccessible(page);
      await page.screenshot({
        path: `e2e-screens/thread-${scheme}-${test.info().project.name}.png`,
        fullPage: true,
      });
    });
  });
}

test('skip link is the first tab stop and moves focus to main', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard test');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('signed-out visitors are sent to login and returned to the thread', async ({ page }) => {
  await page.goto('/thread/2');
  await expect(page).toHaveURL(/\/login\?next=%2Fthread%2F2/);
  const form = page.getByRole('region', { name: 'Log in' });
  await form.getByLabel('Email address').fill('jess@jess.com');
  await form.getByLabel('Password').fill('jessiscool');
  await form.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/thread\/2$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What Have I done to my baby?');
});

test('a parent can list an item, see it, and delete it', async ({ page }, info) => {
  await logIn(page);
  await page.goto('/thread/1');
  const title = `Pram ${info.project.name} ${Date.now()}`;
  await page.getByLabel('Item', { exact: true }).fill(title);
  await page.getByLabel(/^Price/).fill('120');
  await page.getByLabel('Description').fill('Barely used, folds flat.');
  await page.getByLabel('Photo', { exact: true }).setInputFiles('public/images/seeds/pram.webp');
  await page.getByLabel(/Describe your photo/).fill('A grey pram, folded');
  await page.getByRole('button', { name: 'Post listing' }).click();

  await expect(page.getByText('Your listing is live!')).toBeVisible();
  const latest = page.getByRole('article', { name: title });
  await expect(latest).toBeVisible();
  await expect(latest.getByText('$120.00')).toBeVisible();
  await expect(latest.getByRole('img', { name: 'A grey pram, folded' })).toBeVisible();
  // form was reset
  await expect(page.getByLabel('Item', { exact: true })).toHaveValue('');

  await latest.getByRole('button', { name: `Delete “${title}”` }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete this post?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete post' }).click();
  await expect(page.getByText('Post deleted.')).toBeVisible();
  await expect(page.getByRole('article', { name: title })).toHaveCount(0);
});

test('theme toggle switches and persists', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Colour theme/ });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
