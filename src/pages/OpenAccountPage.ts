import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OpenAccountPage extends BasePage {
  private readonly openNewAccountLink: Locator;
  private readonly accountTypeDropdown: Locator;
  private readonly fundingSourceAccountDropdown: Locator;
  private readonly openNewAccountButton: Locator;
  public readonly confirmationHeader: Locator;
  private readonly newAccountIdLink: Locator;

  constructor(page: Page) {
    super(page);
    this.openNewAccountLink = page.locator('a[href*="openaccount.htm"]');
    this.accountTypeDropdown = page.locator('#type');
    this.fundingSourceAccountDropdown = page.locator('#fromAccountId');
    this.openNewAccountButton = page.locator('input[value="Open New Account"]');
    this.confirmationHeader = page.locator('#openAccountResult h1.title');
    this.newAccountIdLink = page.locator('#newAccountId');
  }

  async openSavingsAccount(fundingAccountId: string): Promise<string> {
    await this.openNewAccountLink.click();
    await this.accountTypeDropdown.waitFor({ state: 'visible' });
    await this.accountTypeDropdown.selectOption('1');
    await this.fundingSourceAccountDropdown
      .locator(`option[value="${fundingAccountId}"]`)
      .waitFor({ state: 'attached' });
    await this.fundingSourceAccountDropdown.selectOption(fundingAccountId);
    await this.openNewAccountButton.click();
    await this.newAccountIdLink.waitFor({ state: 'visible' });

    const accountId = await this.newAccountIdLink.textContent();

    if (accountId === null || accountId.trim() === '') {
      throw new Error('New account link did not contain an account ID');
    }

    return accountId.trim();
  }
}
