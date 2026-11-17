import { test as base } from '@playwright/test';
import { ParaBankApi } from '@api/ParaBankApi';
import { EnvConfig } from '@config/env.config';
import { BankAuthPage } from '@pages/BankAuthPage';
import { AccountsOverviewPage } from '@pages/AccountsOverviewPage';
import { OpenAccountPage } from '@pages/OpenAccountPage';
import { TransferFundsPage } from '@pages/TransferFundsPage';
import { BillPayPage } from '@pages/BillPayPage';
import { FindTransactionsPage } from '@pages/FindTransactionsPage';
import { CustomerProfile, generateUniqueCustomer } from '@utils/dataGenerator';

export interface RegisteredCustomer {
  profile: CustomerProfile;
  password: string;
  customerId: number;
  checkingAccountId: string;
}

type BankingFixtures = {
  bankApi: ParaBankApi;
  /** A freshly registered customer. The page is logged in and on the Accounts Overview. */
  customer: RegisteredCustomer;
  bankAuthPage: BankAuthPage;
  accountsOverviewPage: AccountsOverviewPage;
  openAccountPage: OpenAccountPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  findTransactionsPage: FindTransactionsPage;
};

export const test = base.extend<BankingFixtures>({
  bankApi: async ({ page }, use) => {
    await use(new ParaBankApi(page.request));
  },
  customer: async ({ bankApi, page }, use) => {
    const profile = generateUniqueCustomer();
    const password = EnvConfig.defaultPassword;

    await bankApi.registerCustomer(profile, password);
    const { id: customerId } = await bankApi.login(profile.username, password);
    const [checkingAccount] = await bankApi.getAccounts(customerId);
    await page.goto('overview.htm');

    await use({
      profile,
      password,
      customerId,
      checkingAccountId: String(checkingAccount.id),
    });
  },
  bankAuthPage: async ({ page }, use) => {
    await use(new BankAuthPage(page));
  },
  accountsOverviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },
  openAccountPage: async ({ page }, use) => {
    await use(new OpenAccountPage(page));
  },
  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },
  billPayPage: async ({ page }, use) => {
    await use(new BillPayPage(page));
  },
  findTransactionsPage: async ({ page }, use) => {
    await use(new FindTransactionsPage(page));
  },
});

export { expect } from '@playwright/test';
