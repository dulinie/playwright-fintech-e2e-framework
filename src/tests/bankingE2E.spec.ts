import { test, expect } from '@fixtures/base.fixture';
import { generateUniqueCustomer } from '@utils/dataGenerator';
import { EnvConfig } from '@config/env.config';

test.describe('ParaBank E2E - Core Customer Banking Lifecycle', () => {

  test('Milestone 1: Customer Onboarding, Logout, and Fresh Authentication', async ({ bankAuthPage }) => {
    const customer = generateUniqueCustomer();
    const password = EnvConfig.defaultPassword;

    await test.step('Navigate to ParaBank portal and register new customer', async () => {
      await bankAuthPage.navigateTo();
      await bankAuthPage.registerNewCustomer(customer, password);
      await expect(bankAuthPage.welcomeHeader).toHaveText(`Welcome ${customer.username}`);
    });

    await test.step('Log out and verify re-authentication with newly created credentials', async () => {
      await bankAuthPage.logout();
      await bankAuthPage.login(customer.username, password);
      await expect(bankAuthPage.accountsOverviewHeader).toBeVisible();
    });
  });

});
