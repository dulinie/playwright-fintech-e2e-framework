import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CustomerProfile } from '@utils/dataGenerator';

export class BankAuthPage extends BasePage {
  private readonly registerLink: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly addressInput: Locator;
  private readonly cityInput: Locator;
  private readonly stateInput: Locator;
  private readonly zipCodeInput: Locator;
  private readonly phoneInput: Locator;
  private readonly ssnInput: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly registerButton: Locator;
  private readonly logoutLink: Locator;
  private readonly loginUsernameInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginButton: Locator;

  public readonly welcomeHeader: Locator;
  public readonly accountsOverviewHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.registerLink = page.getByRole('link', { name: 'Register' });
    this.firstNameInput = page.locator('input[id="customer.firstName"]');
    this.lastNameInput = page.locator('input[id="customer.lastName"]');
    this.addressInput = page.locator('input[id="customer.address.street"]');
    this.cityInput = page.locator('input[id="customer.address.city"]');
    this.stateInput = page.locator('input[id="customer.address.state"]');
    this.zipCodeInput = page.locator('input[id="customer.address.zipCode"]');
    this.phoneInput = page.locator('input[id="customer.phoneNumber"]');
    this.ssnInput = page.locator('input[id="customer.ssn"]');
    this.usernameInput = page.locator('input[id="customer.username"]');
    this.passwordInput = page.locator('input[id="customer.password"]');
    this.confirmPasswordInput = page.locator('input[id="repeatedPassword"]');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.logoutLink = page.getByRole('link', { name: 'Log Out' });
    this.loginUsernameInput = page.locator('input[name="username"]');
    this.loginPasswordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log In' });

    this.welcomeHeader = page.locator('#rightPanel h1.title');
    this.accountsOverviewHeader = page.getByRole('heading', { name: 'Accounts Overview' });
  }

  async registerNewCustomer(customer: CustomerProfile, password: string): Promise<void> {
    await this.registerLink.click();
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.addressInput.fill(customer.address);
    await this.cityInput.fill(customer.city);
    await this.stateInput.fill(customer.state);
    await this.zipCodeInput.fill(customer.zipCode);
    await this.phoneInput.fill(customer.phone);
    await this.ssnInput.fill(customer.ssn);
    await this.usernameInput.fill(customer.username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.registerButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.loginUsernameInput.fill(username);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }
}
