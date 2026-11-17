import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PayeeDetails } from '@data/bankingData';

export class BillPayPage extends BasePage {
  private readonly billPayLink: Locator;
  private readonly payeeNameInput: Locator;
  private readonly payeeAddressInput: Locator;
  private readonly payeeCityInput: Locator;
  private readonly payeeStateInput: Locator;
  private readonly payeeZipCodeInput: Locator;
  private readonly payeePhoneInput: Locator;
  private readonly payeeAccountNumberInput: Locator;
  private readonly verifyAccountInput: Locator;
  private readonly amountInput: Locator;
  private readonly fromAccountDropdown: Locator;
  private readonly sendPaymentButton: Locator;
  private readonly resultPanel: Locator;
  private readonly errorPanel: Locator;
  public readonly confirmationHeader: Locator;
  public readonly payeeNameResult: Locator;
  public readonly amountResult: Locator;
  public readonly fromAccountIdResult: Locator;

  constructor(page: Page) {
    super(page);
    this.billPayLink = page.locator('a[href*="billpay.htm"]');
    this.payeeNameInput = page.locator('input[name="payee.name"]');
    this.payeeAddressInput = page.locator('input[name="payee.address.street"]');
    this.payeeCityInput = page.locator('input[name="payee.address.city"]');
    this.payeeStateInput = page.locator('input[name="payee.address.state"]');
    this.payeeZipCodeInput = page.locator('input[name="payee.address.zipCode"]');
    this.payeePhoneInput = page.locator('input[name="payee.phoneNumber"]');
    this.payeeAccountNumberInput = page.locator('input[name="payee.accountNumber"]');
    this.verifyAccountInput = page.locator('input[name="verifyAccount"]');
    this.amountInput = page.locator('input[name="amount"]');
    this.fromAccountDropdown = page.locator('select[name="fromAccountId"]');
    this.sendPaymentButton = page.getByRole('button', { name: 'Send Payment' });
    this.resultPanel = page.locator('#billpayResult');
    this.errorPanel = page.locator('#billpayError');
    this.confirmationHeader = page.locator('#billpayResult h1.title');
    this.payeeNameResult = page.locator('#payeeName');
    this.amountResult = page.locator('#amount');
    this.fromAccountIdResult = page.locator('#fromAccountId');
  }

  async payBill(
    payee: PayeeDetails,
    amount: string,
    fromAccountId: string,
  ): Promise<void> {
    await this.billPayLink.click();
    await this.payeeNameInput.fill(payee.name);
    await this.payeeAddressInput.fill(payee.address);
    await this.payeeCityInput.fill(payee.city);
    await this.payeeStateInput.fill(payee.state);
    await this.payeeZipCodeInput.fill(payee.zipCode);
    await this.payeePhoneInput.fill(payee.phone);
    await this.payeeAccountNumberInput.fill(payee.accountNumber);
    await this.verifyAccountInput.fill(payee.accountNumber);
    await this.amountInput.fill(amount);
    await this.fromAccountDropdown
      .locator(`option[value="${fromAccountId}"]`)
      .waitFor({ state: 'attached' });
    await this.fromAccountDropdown.selectOption(fromAccountId);
    await this.sendPaymentButton.click();
    await this.waitForResultOrError(this.resultPanel, this.errorPanel, 'Bill payment');
  }
}
