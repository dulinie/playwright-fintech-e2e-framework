import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FindTransactionsPage extends BasePage {
  private readonly findTransactionsLink: Locator;
  private readonly accountSelector: Locator;
  private readonly amountInput: Locator;
  private readonly findByAmountButton: Locator;
  private readonly resultsContainer: Locator;
  public readonly transactionTable: Locator;
  public readonly transactionDescriptions: Locator;
  public readonly debitAmountCells: Locator;

  constructor(page: Page) {
    super(page);
    this.findTransactionsLink = page.locator('a[href*="findtrans.htm"]');
    this.accountSelector = page.locator('#accountId');
    this.amountInput = page.locator('#amount');
    this.findByAmountButton = page.locator('button#findByAmount');
    this.resultsContainer = page.locator('#resultContainer');
    this.transactionTable = page.locator('#transactionTable');
    this.transactionDescriptions = page.locator(
      '#transactionTable tbody tr td:nth-child(2) a',
    );
    this.debitAmountCells = page.locator('#transactionTable tbody tr td:nth-child(3)');
  }

  async searchTransactionsByAmount(accountId: string, amount: string): Promise<void> {
    await this.findTransactionsLink.click();
    await this.accountSelector
      .locator(`option[value="${accountId}"]`)
      .waitFor({ state: 'attached' });
    await this.accountSelector.selectOption(accountId);
    await this.amountInput.fill(amount);
    await this.findByAmountButton.click();
    await this.resultsContainer.waitFor({ state: 'visible' });
    await this.transactionTable.waitFor({ state: 'visible' });
  }

  async getTransactionCount(): Promise<number> {
    await this.transactionTable.waitFor({ state: 'visible' });
    return this.transactionTable.locator('tbody tr').count();
  }
}
