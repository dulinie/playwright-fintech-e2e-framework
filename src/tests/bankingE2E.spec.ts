import { test, expect } from '@fixtures/base.fixture';
import { Request, Route } from '@playwright/test';
import { generateUniqueCustomer } from '@utils/dataGenerator';
import { EnvConfig } from '@config/env.config';
import { BILL_PAYMENT_AMOUNT, TRANSFER_AMOUNT, UTILITY_PAYEE } from '@data/bankingData';

test.describe('ParaBank E2E - Core Customer Banking', () => {
  test('a new customer can register, log out and log back in', async ({
    bankAuthPage,
    accountsOverviewPage,
  }) => {
    const customer = generateUniqueCustomer();
    const password = EnvConfig.defaultPassword;

    await test.step('Register a new customer through the UI', async () => {
      await bankAuthPage.navigateTo();
      await bankAuthPage.registerNewCustomer(customer, password);
      await expect(bankAuthPage.welcomeHeader).toHaveText(`Welcome ${customer.username}`);
    });

    await test.step('Log out and log back in with the new credentials', async () => {
      await bankAuthPage.logout();
      await bankAuthPage.login(customer.username, password);
      await expect(bankAuthPage.accountsOverviewHeader).toBeVisible();
    });

    await test.step('The new customer has a primary checking account', async () => {
      expect(await accountsOverviewPage.getPrimaryCheckingAccountId()).toMatch(/^\d+$/);
    });
  });

  test('a customer can open a savings account funded from checking', async ({
    customer,
    openAccountPage,
    accountsOverviewPage,
  }) => {
    const savingsAccountId = await test.step('Open a savings account', async () => {
      const accountId = await openAccountPage.openAccount('SAVINGS', customer.checkingAccountId);
      await expect(openAccountPage.confirmationHeader).toHaveText('Account Opened!');
      return accountId;
    });

    await test.step('Both accounts are listed in the accounts overview', async () => {
      await accountsOverviewPage.navigateToAccountsOverview();
      await expect(accountsOverviewPage.accountRow(customer.checkingAccountId)).toBeVisible();
      await expect(accountsOverviewPage.accountRow(savingsAccountId)).toBeVisible();
    });
  });

  test('transferring funds moves the amount from checking to savings', async ({
    customer,
    bankApi,
    accountsOverviewPage,
    transferFundsPage,
  }) => {
    const savings = await bankApi.openAccount(
      customer.customerId,
      'SAVINGS',
      customer.checkingAccountId,
    );
    const savingsAccountId = String(savings.id);
    const amount = Number(TRANSFER_AMOUNT);

    const { initialChecking, initialSavings } = await test.step(
      'Capture initial balances',
      async () => {
        await accountsOverviewPage.navigateToAccountsOverview();
        return {
          initialChecking: await accountsOverviewPage.getAccountBalance(customer.checkingAccountId),
          initialSavings: await accountsOverviewPage.getAccountBalance(savingsAccountId),
        };
      },
    );

    await test.step('Transfer funds from checking to savings', async () => {
      await transferFundsPage.transferFunds(TRANSFER_AMOUNT, customer.checkingAccountId, savingsAccountId);
      await expect(transferFundsPage.confirmationHeader).toHaveText('Transfer Complete!');
      await expect(transferFundsPage.amountResult).toContainText(`$${TRANSFER_AMOUNT}`);
      await expect(transferFundsPage.fromAccountIdResult).toHaveText(customer.checkingAccountId);
      await expect(transferFundsPage.toAccountIdResult).toHaveText(savingsAccountId);
    });

    await test.step('Both balances reflect the transfer', async () => {
      await accountsOverviewPage.navigateToAccountsOverview();
      await expect
        .poll(() => accountsOverviewPage.getAccountBalance(customer.checkingAccountId))
        .toBeCloseTo(initialChecking - amount, 2);
      await expect
        .poll(() => accountsOverviewPage.getAccountBalance(savingsAccountId))
        .toBeCloseTo(initialSavings + amount, 2);
    });
  });

  test('find transactions by amount returns the transfer debit', async ({
    customer,
    bankApi,
    findTransactionsPage,
  }) => {
    const savings = await bankApi.openAccount(
      customer.customerId,
      'SAVINGS',
      customer.checkingAccountId,
    );
    await bankApi.transfer(customer.checkingAccountId, String(savings.id), TRANSFER_AMOUNT);

    await findTransactionsPage.searchTransactionsByAmount(customer.checkingAccountId, TRANSFER_AMOUNT);

    const transferRow = findTransactionsPage.transactionRowsWithDescription('Funds Transfer Sent');
    await expect(transferRow).toHaveCount(1);
    await expect(findTransactionsPage.debitCell(transferRow)).toHaveText(`$${TRANSFER_AMOUNT}`);
  });

  test('bill pay (mocked backend): UI sends the correct request and renders the confirmation', async ({
    page,
    customer,
    billPayPage,
  }) => {
    // The public sandbox's bill-pay endpoint returns 500, so the backend is stubbed.
    // This test checks the UI <-> API contract: what the form sends and how it renders
    // the response. It does NOT check that the real ledger is debited.
    const capturedRequests: Request[] = [];

    await page.route('**/services_proxy/bank/billpay*', async (route: Route) => {
      const request = route.request();

      if (request.method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedRequests.push(request);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          payeeName: UTILITY_PAYEE.name,
          amount: Number(BILL_PAYMENT_AMOUNT),
          accountId: Number(customer.checkingAccountId),
        }),
      });
    });

    await billPayPage.payBill(UTILITY_PAYEE, BILL_PAYMENT_AMOUNT, customer.checkingAccountId);

    await test.step('The request carries the account, amount and payee', async () => {
      expect(capturedRequests).toHaveLength(1);
      const requestUrl = new URL(capturedRequests[0].url());
      expect(requestUrl.searchParams.get('accountId')).toBe(customer.checkingAccountId);
      expect(requestUrl.searchParams.get('amount')).toBe(BILL_PAYMENT_AMOUNT);
      expect(capturedRequests[0].postDataJSON()).toEqual({
        name: UTILITY_PAYEE.name,
        address: {
          street: UTILITY_PAYEE.address,
          city: UTILITY_PAYEE.city,
          state: UTILITY_PAYEE.state,
          zipCode: UTILITY_PAYEE.zipCode,
        },
        phoneNumber: UTILITY_PAYEE.phone,
        accountNumber: UTILITY_PAYEE.accountNumber,
      });
    });

    await test.step('The confirmation renders the response', async () => {
      await expect(billPayPage.confirmationHeader).toHaveText('Bill Payment Complete');
      await expect(billPayPage.payeeNameResult).toHaveText(UTILITY_PAYEE.name);
      await expect(billPayPage.amountResult).toContainText(`$${BILL_PAYMENT_AMOUNT}`);
      await expect(billPayPage.fromAccountIdResult).toHaveText(customer.checkingAccountId);
    });
  });
});
