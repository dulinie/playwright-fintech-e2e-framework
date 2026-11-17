# 🏦 Playwright Fintech E2E Automation Framework
![Playwright E2E](https://github.com/dulinie/playwright-fintech-e2e-framework/actions/workflows/playwright.yml/badge.svg)


A scalable Quality Engineering framework built with **Playwright** and **TypeScript**, following patterns used in enterprise test frameworks. It uses the **Page Object Model (POM)**, custom fixtures, API-driven test setup and network interception (`page.route`) to test digital banking workflows on the [ParaBank](https://parabank.parasoft.com/parabank/index.htm) demo bank.

## 🎯 Test Coverage
`src/tests/bankingE2E.spec.ts` contains five independent tests that run in parallel. Each one creates its own customer, so they never share state:

1. **Registration & authentication:** Registers a customer through the UI with a unique (`crypto.randomUUID`) username, then logs out and back in with the new credentials.
2. **Opening a savings account:** Opens a savings account funded from checking and checks that both accounts appear in the Accounts Overview.
3. **Fund transfer & balance reconciliation:** Transfers funds from checking to savings and checks that both balances change by the exact amount.
4. **Transaction search:** Searches transactions by amount and checks for exactly one "Funds Transfer Sent" row with the right debit.
5. **Bill pay with a mocked backend:** The demo site's bill-pay service is unreliable, so `page.route()` intercepts the `/services_proxy/bank/billpay` call and returns a stubbed response. The test checks the request the UI sends (account, amount and full payee details) and how the confirmation is shown. Because the call is mocked, the real ledger is not checked.

## 🏗️ Architectural Highlights
* **API-driven test setup (`src/api/ParaBankApi.ts`):** Tests 2–5 create their customer, accounts and transfers through ParaBank's HTTP endpoints rather than the UI. Setup is faster and more stable, and each test uses the UI only for the feature it checks. The client uses `page.request`, which shares cookies with the browser, so after setup the page is already logged in.
* **Custom fixtures (`src/fixtures/base.fixture.ts`):** `test.extend()` provides the Page Objects, the API client and a ready-to-use `customer` (registered, logged in, with a known checking account ID) to each test.
* **Page Object Model (`src/pages/`):** One class per page, extending a shared `BasePage`. Forms wait for either their result panel or their error panel, so a failure shows ParaBank's own error message instead of a timeout.
* **Resilient assertions:** Assertions retry until they pass (Playwright's web-first `expect` and `expect.poll`), and locators prefer accessible roles (`getByRole`).
* **Strict TypeScript & path aliases (`tsconfig.json`):** Strict type-checking (`npm run typecheck`) and clean imports (`@api/*`, `@pages/*`, `@fixtures/*`, `@utils/*`, `@data/*`, `@config/*`).
* **Cross-browser projects:** Configured for **Chromium**, **Firefox** and **WebKit**, with traces, screenshots and video kept on failure.
* **CI/CD pipeline (`.github/workflows/playwright.yml`):** GitHub Actions runs a type-check and the suite on every push and pull request to `main`, and publishes the HTML report as a build artifact. CI runs on Chromium only, to stay within the public demo site's rate limit; all three browsers can be run locally.

## 📂 Project Structure
```text
playwright-fintech-e2e-framework/
├── .github/workflows/
│   └── playwright.yml              # GitHub Actions CI workflow
├── src/
│   ├── api/
│   │   └── ParaBankApi.ts          # HTTP client for fast test setup
│   ├── config/
│   │   └── env.config.ts           # Environment variable loader
│   ├── fixtures/
│   │   └── base.fixture.ts         # Page Objects, API client & customer fixtures
│   ├── pages/
│   │   ├── BasePage.ts             # Shared navigation & result/error handling
│   │   ├── BankAuthPage.ts         # Registration, login & logout
│   │   ├── AccountsOverviewPage.ts # Account rows & balance parsing
│   │   ├── OpenAccountPage.ts      # Opening new accounts
│   │   ├── TransferFundsPage.ts    # Internal fund transfers
│   │   ├── BillPayPage.ts          # Bill payments
│   │   └── FindTransactionsPage.ts # Transaction search
│   ├── test-data/
│   │   └── bankingData.ts          # Typed payee & amount constants
│   ├── tests/
│   │   └── bankingE2E.spec.ts      # Five independent banking tests
│   └── utils/
│       └── dataGenerator.ts        # Unique customer profile generator
├── .env.example                    # Environment variable template
├── playwright.config.ts            # Browsers, timeouts & reporting
└── tsconfig.json                   # Strict TypeScript & path aliases
```

## 🛠️ Local Setup & Execution

1. **Install dependencies and browsers:**
   ```bash
   npm install
   npx playwright install
   ```
2. **Configure environment variables (optional):**
   Copy `.env.example` to `.env` and adjust the values if needed. Without a `.env`, the defaults in `src/config/env.config.ts` are used.
3. **Type-check:**
   ```bash
   npm run typecheck
   ```
4. **Run the tests:**
   ```bash
   npx playwright test                     # all three browsers
   npx playwright test --project=Chromium  # Chromium only, as in CI
   ```
5. **View the HTML report:**
   ```bash
   npx playwright show-report
   ```

> **Note:** ParaBank is a shared public demo site and rate-limits heavy use. If tests fail with HTTP 429 or a Cloudflare "Error 1015" ("You are being rate limited") page, wait a few minutes, then run a single browser with one worker so requests go out one test at a time:
>
> ```bash
> npx playwright test --project=chromium --workers=1
> ```

