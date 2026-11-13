import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransferFundsPage extends BasePage {
  private readonly transferFundsLink: Locator;
  private readonly amountInput: Locator;
  private readonly fromAccountDropdown: Locator;
  private readonly toAccountDropdown: Locator;
  private readonly transferButton: Locator;
  public readonly confirmationHeader: Locator;
  public readonly amountResult: Locator;
  public readonly fromAccountIdResult: Locator;
  public readonly toAccountIdResult: Locator;

  constructor(page: Page) {
    super(page);
    this.transferFundsLink = page.locator('a[href*="transfer.htm"]');
    this.amountInput = page.locator('#amount');
    this.fromAccountDropdown = page.locator('#fromAccountId');
    this.toAccountDropdown = page.locator('#toAccountId');
    this.transferButton = page.locator('input[value="Transfer"]');
    this.confirmationHeader = page.locator('#showResult h1.title');
    this.amountResult = page.locator('#amountResult');
    this.fromAccountIdResult = page.locator('#fromAccountIdResult');
    this.toAccountIdResult = page.locator('#toAccountIdResult');
  }

  async transferFunds(
    amount: string,
    fromAccountId: string,
    toAccountId: string,
  ): Promise<void> {
    await this.transferFundsLink.click();
    await this.fromAccountDropdown
      .locator(`option[value="${fromAccountId}"]`)
      .waitFor({ state: 'attached' });
    await this.toAccountDropdown
      .locator(`option[value="${toAccountId}"]`)
      .waitFor({ state: 'attached' });
    await this.amountInput.fill(amount);
    await this.fromAccountDropdown.selectOption(fromAccountId);
    await this.toAccountDropdown.selectOption(toAccountId);
    await this.transferButton.click();
    await this.confirmationHeader.waitFor({ state: 'visible' });
  }
}
