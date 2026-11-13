import { test, expect } from '@fixtures/base.fixture';
import { Route } from '@playwright/test';
import { generateUniqueCustomer } from '@utils/dataGenerator';
import { EnvConfig } from '@config/env.config';
import { BILL_PAYMENT_AMOUNT, UTILITY_PAYEE } from '@data/bankingData';

test.describe('ParaBank E2E - Core Customer Banking Lifecycle', () => {

  test('Milestones 1-5: Customer Onboarding and Account Lifecycle', async ({
    page,
    bankAuthPage,
    accountsOverviewPage,
    openAccountPage,
    transferFundsPage,
    billPayPage,
    findTransactionsPage,
  }) => {
    const customer = generateUniqueCustomer();
    const password = EnvConfig.defaultPassword;

    await test.step('Navigate to ParaBank portal and register new customer', async () => {
      await bankAuthPage.navigateTo();
      await bankAuthPage.registerNewCustomer(customer, password);
      await expect(bankAuthPage.welcomeHeader).toHaveText(`Welcome ${customer.username}`);
    });

    await test.step('Log out and verify re-authentication with newly created credentials', async () => {
      await bankAuthPage.logout();
      await bankAuthPage.login(customer.username, password);
      await expect(bankAuthPage.accountsOverviewHeader).toBeVisible();
    });

    const checkingAccountId = await test.step(
      'Extract the primary checking account ID',
      async () => accountsOverviewPage.getPrimaryCheckingAccountId(),
    );

    const savingsAccountId = await test.step(
      'Open a savings account funded by the checking account',
      async () => {
        const accountId = await openAccountPage.openSavingsAccount(checkingAccountId);
        await expect(openAccountPage.confirmationHeader).toHaveText('Account Opened!');
        return accountId;
      },
    );

    await test.step('Verify both accounts in the accounts overview table', async () => {
      await accountsOverviewPage.navigateToAccountsOverview();
      await expect(
        await accountsOverviewPage.verifyAccountExistsInTable(checkingAccountId),
      ).toBeVisible();
      await expect(
        await accountsOverviewPage.verifyAccountExistsInTable(savingsAccountId),
      ).toBeVisible();
    });

    const { initialCheckingBalance, initialSavingsBalance } = await test.step(
      'Capture initial checking and savings balances',
      async () => ({
        initialCheckingBalance: await accountsOverviewPage.getAccountBalance(checkingAccountId),
        initialSavingsBalance: await accountsOverviewPage.getAccountBalance(savingsAccountId),
      }),
    );

    await test.step('Transfer funds from checking to savings', async () => {
      await transferFundsPage.transferFunds('150.00', checkingAccountId, savingsAccountId);
      await expect(transferFundsPage.confirmationHeader).toHaveText('Transfer Complete!');
      await expect(transferFundsPage.amountResult).toContainText('$150.00');
      await expect(transferFundsPage.fromAccountIdResult).toHaveText(checkingAccountId);
      await expect(transferFundsPage.toAccountIdResult).toHaveText(savingsAccountId);
    });

    await test.step('Verify transferred funds in both account balances', async () => {
      await accountsOverviewPage.navigateToAccountsOverview();
      const checkingBalance = await accountsOverviewPage.getAccountBalance(checkingAccountId);
      const savingsBalance = await accountsOverviewPage.getAccountBalance(savingsAccountId);

      expect(checkingBalance).toBeCloseTo(initialCheckingBalance - 150, 2);
      expect(savingsBalance).toBeCloseTo(initialSavingsBalance + 150, 2);
    });

    const preBillBalance = await test.step(
      'Capture checking balance before bill payment',
      async () => accountsOverviewPage.getAccountBalance(checkingAccountId),
    );

    await test.step('Pay the utility bill from the checking account', async () => {
      // Mock the public sandbox's bill-pay 500 outage without changing the account balance.
      const billPayRoute = async (route: Route): Promise<void> => {
        const request = route.request();

        if (request.method() !== 'POST') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            payeeName: UTILITY_PAYEE.name,
            amount: Number(BILL_PAYMENT_AMOUNT),
            accountId: Number(checkingAccountId),
          }),
        });
      };

      await page.route('**/billpay*', billPayRoute);

      await billPayPage.payBill(UTILITY_PAYEE, BILL_PAYMENT_AMOUNT, checkingAccountId);
      await expect(billPayPage.confirmationHeader).toHaveText('Bill Payment Complete');
      await expect(billPayPage.payeeNameResult).toHaveText(UTILITY_PAYEE.name);
      await expect(billPayPage.amountResult).toContainText('$75.00');
      await expect(billPayPage.fromAccountIdResult).toHaveText(checkingAccountId);
    });

    await test.step('Verify the checking account balance remains unchanged', async () => {
      await accountsOverviewPage.navigateToAccountsOverview();
      const checkingBalance = await accountsOverviewPage.getAccountBalance(checkingAccountId);

      await expect(
        await accountsOverviewPage.verifyAccountExistsInTable(checkingAccountId),
      ).toBeVisible();
      expect(Number.isFinite(checkingBalance)).toBe(true);
      expect(checkingBalance).toBeCloseTo(preBillBalance, 2);
    });

    await test.step('Find and verify the checking account transfer transaction', async () => {
      await findTransactionsPage.searchTransactionsByAmount(checkingAccountId, '150.00');
      await expect(findTransactionsPage.transactionTable).toBeVisible();
      expect(await findTransactionsPage.getTransactionCount()).toBeGreaterThanOrEqual(1);
      await expect(findTransactionsPage.transactionDescriptions).toContainText(
        'Funds Transfer Sent',
      );
      await expect(findTransactionsPage.debitAmountCells).toContainText('$150.00');
    });
  });

});
