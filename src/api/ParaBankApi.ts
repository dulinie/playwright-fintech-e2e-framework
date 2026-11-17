import { APIRequestContext, APIResponse } from '@playwright/test';
import { CustomerProfile } from '@utils/dataGenerator';

export type AccountType = 'CHECKING' | 'SAVINGS';

const ACCOUNT_TYPE_CODE: Record<AccountType, number> = { CHECKING: 0, SAVINGS: 1 };
const JSON_HEADERS = { Accept: 'application/json' };

export interface ApiCustomer {
  id: number;
  firstName: string;
  lastName: string;
}

export interface ApiAccount {
  id: number;
  customerId: number;
  type: AccountType | 'LOAN';
  balance: number;
}

/**
 * Thin client for ParaBank's HTTP endpoints, used for fast test setup.
 * Built on `page.request`, so cookies are shared with the browser page:
 * registering here leaves the page logged in as the new customer.
 * Paths are relative to `use.baseURL`.
 */
export class ParaBankApi {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async registerCustomer(customer: CustomerProfile, password: string): Promise<void> {
    // Loading the form first establishes the session the form post needs (otherwise HTTP 500).
    await this.request.get('register.htm');
    const response = await this.request.post('register.htm', {
      form: {
        'customer.firstName': customer.firstName,
        'customer.lastName': customer.lastName,
        'customer.address.street': customer.address,
        'customer.address.city': customer.city,
        'customer.address.state': customer.state,
        'customer.address.zipCode': customer.zipCode,
        'customer.phoneNumber': customer.phone,
        'customer.ssn': customer.ssn,
        'customer.username': customer.username,
        'customer.password': password,
        repeatedPassword: password,
      },
    });

    const body = await response.text();
    if (!response.ok() || !body.includes(`Welcome ${customer.username}`)) {
      throw new Error(`Registering ${customer.username} failed (HTTP ${response.status()})`);
    }
  }

  async login(username: string, password: string): Promise<ApiCustomer> {
    const response = await this.request.get(
      `services/bank/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`,
      { headers: JSON_HEADERS },
    );
    return this.parseJson<ApiCustomer>(response, 'login');
  }

  async getAccounts(customerId: number): Promise<ApiAccount[]> {
    const response = await this.request.get(`services/bank/customers/${customerId}/accounts`, {
      headers: JSON_HEADERS,
    });
    return this.parseJson<ApiAccount[]>(response, 'get accounts');
  }

  async openAccount(
    customerId: number,
    type: AccountType,
    fromAccountId: string,
  ): Promise<ApiAccount> {
    const response = await this.request.post('services/bank/createAccount', {
      headers: JSON_HEADERS,
      params: { customerId, newAccountType: ACCOUNT_TYPE_CODE[type], fromAccountId },
    });
    return this.parseJson<ApiAccount>(response, 'open account');
  }

  async transfer(fromAccountId: string, toAccountId: string, amount: string): Promise<void> {
    const response = await this.request.post('services/bank/transfer', {
      params: { fromAccountId, toAccountId, amount },
    });
    if (!response.ok()) {
      throw new Error(`ParaBank API transfer failed: HTTP ${response.status()} ${await response.text()}`);
    }
  }

  private async parseJson<T>(response: APIResponse, action: string): Promise<T> {
    if (!response.ok()) {
      throw new Error(`ParaBank API ${action} failed: HTTP ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }
}
