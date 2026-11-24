import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a container with WCAG 2.0–2.2 A/AA rules.
 * (Colour contrast needs real layout, so it is covered by the e2e suite
 * and by the token contrast test instead.)
 */
export async function expectNoAxeViolations(container: Element) {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
  );
  expect(summary).toEqual([]);
}
