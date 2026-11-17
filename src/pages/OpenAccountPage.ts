import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AccountType } from '@api/ParaBankApi';

export class OpenAccountPage extends BasePage {
  private readonly openNewAccountLink: Locator;
  private readonly accountTypeDropdown: Locator;
  private readonly fundingSourceAccountDropdown: Locator;
  private readonly openNewAccountButton: Locator;
  private readonly resultPanel: Locator;
  private readonly errorPanel: Locator;
  private readonly newAccountIdLink: Locator;
  public readonly confirmationHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.openNewAccountLink = page.locator('a[href*="openaccount.htm"]');
    this.accountTypeDropdown = page.locator('#type');
    this.fundingSourceAccountDropdown = page.locator('#fromAccountId');
    this.openNewAccountButton = page.getByRole('button', { name: 'Open New Account' });
    this.resultPanel = page.locator('#openAccountResult');
    this.errorPanel = page.locator('#openAccountError');
    this.newAccountIdLink = page.locator('#newAccountId');
    this.confirmationHeader = page.locator('#openAccountResult h1.title');
  }

  /** Opens a new account funded from `fundingAccountId` and returns the new account ID. */
  async openAccount(type: AccountType, fundingAccountId: string): Promise<string> {
    await this.openNewAccountLink.click();
    await this.accountTypeDropdown.selectOption({ label: type });
    await this.fundingSourceAccountDropdown
      .locator(`option[value="${fundingAccountId}"]`)
      .waitFor({ state: 'attached' });
    await this.fundingSourceAccountDropdown.selectOption(fundingAccountId);
    await this.openNewAccountButton.click();
    await this.waitForResultOrError(this.resultPanel, this.errorPanel, 'Opening account');
    await this.newAccountIdLink.waitFor({ state: 'visible' });

    const accountId = await this.newAccountIdLink.textContent();

    if (accountId === null || accountId.trim() === '') {
      throw new Error('New account link did not contain an account ID');
    }

    return accountId.trim();
  }
}
