import { test as base } from '@playwright/test';
import { BankAuthPage } from '@pages/BankAuthPage';

type BankingFixtures = {
  bankAuthPage: BankAuthPage;
};

export const test = base.extend<BankingFixtures>({
  bankAuthPage: async ({ page }, use) => {
    const bankAuthPage = new BankAuthPage(page);
    await use(bankAuthPage);
  },
});

export { expect } from '@playwright/test';
