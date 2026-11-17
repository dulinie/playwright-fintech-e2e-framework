# 🏦 Playwright Fintech E2E Automation Framework

An enterprise-grade, scalable Quality Engineering framework built using **Playwright** and **TypeScript**. Engineered around the **Page Object Model (POM)** with custom dependency-injected fixtures, strict TypeScript path aliases, and resilient network interception (`page.route`) to validate end-to-end digital banking workflows.

## 🎯 End-to-End Business Flow Coverage
The test suite models a complete, stateful customer banking lifecycle (`src/tests/bankingE2E.spec.ts`):
1. **Customer Onboarding & Authentication:** Generates cryptographically unique (`crypto.randomUUID`) customer profiles to prevent parallel execution collisions, registers a new account, and validates session logout/login.
2. **Account Lifecycle Management:** Extracts the dynamically assigned Checking Account ID from the DOM, opens a new **Savings Account**, and validates multi-account visibility.
3. **Internal Liquidity & Ledger Reconciliation:** Transfers funds between dynamic Checking and Savings accounts and validates exact mathematical debit/credit balance updates.
4. **External Payment Processing (API Mocking):** Uses Playwright's native `page.route()` network interception to stub `/services_proxy/bank/billpay`, isolating third-party sandbox instability while deterministically verifying Bill Pay UI confirmation states.
5. **Transaction Audit Trail:** Queries the backend transaction ledger via **Find Transactions** to reconcile debit entries and transaction descriptions.

## 🏗️ Architectural Highlights
* **Custom Dependency Injection (`src/fixtures/base.fixture.ts`):** Injects Page Objects directly into test specs via Playwright's `test.extend()`, eliminating boilerplate instantiation.
* **Inheritance & Encapsulation (`src/pages/BasePage.ts`):** Centralizes shared navigation and wait behaviors across all domain Page Objects.
* **Strict TypeScript & Path Aliases (`tsconfig.json`):** Enforces strict type safety and clean modular imports (`@pages/*`, `@fixtures/*`, `@utils/*`, `@data/*`, `@config/*`).
* **Cross-Browser Parallel Execution:** Configured to run concurrently across headless **Chromium**, **Firefox**, and **WebKit** engines.
* **Automated CI/CD Pipeline:** Integrated with **GitHub Actions** (`.github/workflows/playwright.yml`) to execute cross-browser suites on every push/PR and publish downloadable HTML quality reports as build artifacts.

## 📂 Project Structure
```text
playwright-fintech-e2e-framework/
├── .github/workflows/
│   └── playwright.yml              # GitHub Actions CI/CD workflow
├── src/
│   ├── config/
│   │   └── env.config.ts           # Typed environment variable loader
│   ├── fixtures/
│   │   └── base.fixture.ts         # Custom Page Object dependency injection
│   ├── pages/
│   │   ├── BasePage.ts             # Parent Page Object class
│   │   ├── BankAuthPage.ts         # Registration & session authentication
│   │   ├── AccountsOverviewPage.ts # Account ID extraction & balance parsing
│   │   ├── OpenAccountPage.ts      # Savings account creation
│   │   ├── TransferFundsPage.ts    # Internal fund transfers
│   │   ├── BillPayPage.ts          # External utility payments
│   │   └── FindTransactionsPage.ts # Ledger search & audit verification
│   ├── test-data/
│   │   └── bankingData.ts          # Strongly typed payee & transaction constants
│   ├── tests/
│   │   └── bankingE2E.spec.ts      # 5-milestone E2E customer journey
│   └── utils/
│       └── dataGenerator.ts        # Dynamic UUID customer profile generator
├── .env.example                    # Environment variable template
├── playwright.config.ts            # Global cross-browser & trace configuration
└── tsconfig.json                   # Strict TypeScript compiler & alias rules
```

## 🛠️ Local Setup & Execution

1. **Install dependencies and browsers:**
   ```bash
   npm install
   npx playwright install
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `.env` and adjust values if needed.
3. **Run cross-browser tests:**
   ```bash
   npx playwright test
   ```
4. **View interactive HTML report:**
   ```bash
   npx playwright show-report
   ```
