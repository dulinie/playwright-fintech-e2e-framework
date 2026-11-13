import { test as base } from '@playwright/test';
import { BankAuthPage } from '@pages/BankAuthPage';
import { AccountsOverviewPage } from '@pages/AccountsOverviewPage';
import { OpenAccountPage } from '@pages/OpenAccountPage';
import { TransferFundsPage } from '@pages/TransferFundsPage';
import { BillPayPage } from '@pages/BillPayPage';
import { FindTransactionsPage } from '@pages/FindTransactionsPage';

type BankingFixtures = {
  bankAuthPage: BankAuthPage;
  accountsOverviewPage: AccountsOverviewPage;
  openAccountPage: OpenAccountPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  findTransactionsPage: FindTransactionsPage;
};

export const test = base.extend<BankingFixtures>({
  bankAuthPage: async ({ page }, use) => {
    const bankAuthPage = new BankAuthPage(page);
    await use(bankAuthPage);
  },
  accountsOverviewPage: async ({ page }, use) => {
    const accountsOverviewPage = new AccountsOverviewPage(page);
    await use(accountsOverviewPage);
  },
  openAccountPage: async ({ page }, use) => {
    const openAccountPage = new OpenAccountPage(page);
    await use(openAccountPage);
  },
  transferFundsPage: async ({ page }, use) => {
    const transferFundsPage = new TransferFundsPage(page);
    await use(transferFundsPage);
  },
  billPayPage: async ({ page }, use) => {
    const billPayPage = new BillPayPage(page);
    await use(billPayPage);
  },
  findTransactionsPage: async ({ page }, use) => {
    const findTransactionsPage = new FindTransactionsPage(page);
    await use(findTransactionsPage);
  },
});

export { expect } from '@playwright/test';
