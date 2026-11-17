import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountsOverviewPage extends BasePage {
  private readonly accountsOverviewLink: Locator;
  private readonly accountsSummaryTable: Locator;
  private readonly primaryCheckingAccountIdLink: Locator;

  constructor(page: Page) {
    super(page);
    this.accountsOverviewLink = page.locator('a[href*="overview.htm"]');
    this.accountsSummaryTable = page.locator('#accountTable');
    this.primaryCheckingAccountIdLink = page.locator(
      '#accountTable tbody tr:first-child td:first-child a',
    );
  }

  async navigateToAccountsOverview(): Promise<void> {
    await this.accountsOverviewLink.click();
    await this.accountsSummaryTable.waitFor({ state: 'visible' });
  }

  async getPrimaryCheckingAccountId(): Promise<string> {
    await this.primaryCheckingAccountIdLink.waitFor({ state: 'visible' });
    const accountId = await this.primaryCheckingAccountIdLink.textContent();

    if (accountId === null || accountId.trim() === '') {
      throw new Error('Primary checking account link did not contain an account ID');
    }

    return accountId.trim();
  }

  /** The table row for an account. Use with web-first assertions, e.g. `toBeVisible()`. */
  accountRow(accountId: string): Locator {
    return this.accountsSummaryTable
      .locator('tbody tr')
      .filter({ has: this.page.getByRole('link', { name: accountId, exact: true }) });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const accountRow = this.accountRow(accountId);
    await accountRow.waitFor({ state: 'visible' });
    const balanceText = await accountRow.locator('td').nth(1).textContent();

    if (balanceText === null) {
      throw new Error(`Account ${accountId} did not have a balance`);
    }

    const balance = Number(balanceText.replace(/[$,]/g, '').trim());

    if (!Number.isFinite(balance)) {
      throw new Error(`Account ${accountId} had an invalid balance: ${balanceText}`);
    }

    return balance;
  }
}
