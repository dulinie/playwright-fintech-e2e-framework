import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FindTransactionsPage extends BasePage {
  private readonly findTransactionsLink: Locator;
  private readonly accountSelector: Locator;
  private readonly amountInput: Locator;
  private readonly findByAmountButton: Locator;
  private readonly resultsContainer: Locator;
  private readonly errorContainer: Locator;
  public readonly transactionTable: Locator;
  public readonly transactionRows: Locator;

  constructor(page: Page) {
    super(page);
    this.findTransactionsLink = page.locator('a[href*="findtrans.htm"]');
    this.accountSelector = page.locator('#accountId');
    this.amountInput = page.locator('#amount');
    // Several "Find Transactions" buttons share a name, so the ID is the stable hook here.
    this.findByAmountButton = page.locator('button#findByAmount');
    this.resultsContainer = page.locator('#resultContainer');
    this.errorContainer = page.locator('#errorContainer');
    this.transactionTable = page.locator('#transactionTable');
    this.transactionRows = this.transactionTable.locator('tbody tr');
  }

  async searchTransactionsByAmount(accountId: string, amount: string): Promise<void> {
    await this.findTransactionsLink.click();
    await this.accountSelector
      .locator(`option[value="${accountId}"]`)
      .waitFor({ state: 'attached' });
    await this.accountSelector.selectOption(accountId);
    await this.amountInput.fill(amount);
    await this.findByAmountButton.click();
    await this.waitForResultOrError(this.resultsContainer, this.errorContainer, 'Find transactions');
  }

  /** Result rows whose description matches, e.g. 'Funds Transfer Sent'. */
  transactionRowsWithDescription(description: string): Locator {
    return this.transactionRows.filter({
      has: this.page.getByRole('link', { name: description, exact: true }),
    });
  }

  debitCell(row: Locator): Locator {
    return row.locator('td').nth(2);
  }

  creditCell(row: Locator): Locator {
    return row.locator('td').nth(3);
  }
}
