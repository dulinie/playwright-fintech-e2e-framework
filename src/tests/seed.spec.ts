import { test } from '@fixtures/base.fixture';

/**
 * Seed test for the Playwright test agents (planner, generator, healer).
 * Agents use it as their starting point: a freshly registered customer,
 * logged in, with the page on the Accounts Overview.
 * Skipped in CI (see testIgnore in playwright.config.ts).
 */
test.describe('Seed', () => {
  test('seed', async ({ customer, page }) => {
    // Generated steps start here, e.g. navigate via the left-hand menu.
    void customer;
    void page;
  });
});
