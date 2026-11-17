# 🏦 Playwright Fintech E2E Automation Framework
![Playwright E2E](https://github.com/dulinie/playwright-fintech-e2e-framework/actions/workflows/playwright.yml/badge.svg)

A learning project in AI-assisted test engineering. I'm new to Playwright, and I built this framework to practise two skills: **test design and requirement analysis with AI**, and **agentic code scaffolding and generation**. AI tools helped analyse the requirements, generate the code and review it. I directed each step, checked the output against the running application, and fixed what the review found.

The suite tests core digital-banking flows on [ParaBank](https://parabank.parasoft.com/parabank/index.htm), a public demo bank, using **Playwright** and **TypeScript**.

## 🧭 How It Was Built

1. **Requirement analysis and test design (Gemini):** I used Gemini to help write a structured prompt with the CREA prompting framework. The prompt sets out the banking flows to cover, the expected behaviour of each, and the framework conventions to follow.
2. **Code scaffolding and generation (GitHub Copilot):** I gave that prompt to GitHub Copilot, which generated the first version: Page Objects, fixtures, test data, a single end-to-end journey test and a CI pipeline.
3. **Code review and refactoring (Claude Code):** I had Claude Code review the generated framework against Playwright best practices, then worked through the findings with it. Most were fixed in [PR #1](https://github.com/dulinie/playwright-fintech-e2e-framework/pull/1).
4. **Verification:** Every change was type-checked and run against the live ParaBank site, and CI runs the suite on every push and pull request.

## 🔍 What the Review Changed

AI-generated code looked complete and passed, but the review found that some of it proved less than it seemed. These were the most important fixes:

| Before (generated) | Problem | After (reviewed) |
| --- | --- | --- |
| Bill pay mocked the backend, then checked that the balance had not changed | The test only proved its own mock worked | The test now checks the request the UI sends (account, amount, payee) and how the confirmation is shown |
| One long test covered the whole journey | One failure hid every later step, and nothing could run in parallel | Five independent tests, each with its own customer |
| Every test set up its data through the UI | Slow, and a setup failure looked like a failure of the feature under test | Setup goes through ParaBank's HTTP API; the UI is used only for the feature being tested |
| Balances and row counts were read once | Flaky on a page that loads data with AJAX | Assertions retry until they pass (`expect.poll`, web-first `expect`) |
| A ParaBank error page caused a 15-second timeout | Failures gave no useful message | Forms wait for a result or an error, and report ParaBank's error text |
| TypeScript was never type-checked | Type errors could not fail a build | `npm run typecheck` runs in CI |

## 🎯 Requirements and Test Coverage

Each business requirement maps to one independent test in `src/tests/bankingE2E.spec.ts`:

| Requirement | Test | Verified by |
| --- | --- | --- |
| A new customer can register and sign in | `a new customer can register, log out and log back in` | UI: registration, logout and login with the new credentials |
| A customer can open a savings account funded from checking | `a customer can open a savings account funded from checking` | UI: confirmation, and both accounts listed in Accounts Overview |
| A transfer moves the exact amount between accounts | `transferring funds moves the amount from checking to savings` | UI: confirmation, and both balances change by exactly $150.00 |
| A customer can find a transaction by amount | `find transactions by amount returns the transfer debit` | UI: exactly one "Funds Transfer Sent" row with a $150.00 debit |
| Bill pay sends the right payment details | `bill pay (mocked backend): UI sends the correct request and renders the confirmation` | Mocked backend: request contents and confirmation. The real ledger is not checked, because the demo site's bill-pay service returns errors |

## 🩹 Self-Healing: AI-Assisted Test Repair

The tests do not repair themselves while they run. Instead, the repo includes Playwright's test agents (`.claude/agents/`, set up with `npx playwright init-agents`). Their **healer** agent is asked to fix a failing test: it runs the test, inspects the live page and edits the code. A person then reviews the change before it is committed.

**Demo:**

1. **Simulated UI change** ([`d48c372`](https://github.com/dulinie/playwright-fintech-e2e-framework/commit/d48c372)): the Transfer button locator was changed on purpose to look for "Send Transfer", so the transfer test failed with a locator timeout.
2. **Healer diagnosis:** the agent ran the suite and found that 1 test failed and 5 passed. It debugged the failure and took a snapshot of the live page, which showed the button is named "Transfer".
3. **Healer fix** ([`9b9885f`](https://github.com/dulinie/playwright-fintech-e2e-framework/commit/9b9885f)): a one-line change in `TransferFundsPage.ts` that restored the locator. The agent's rerun passed the transfer step, including the "Transfer Complete!" confirmation.
4. **Human review:** I accepted the fix only after checking that it changed the page object alone. The spec and its assertions were untouched, and it added no `test.fixme()`, extra waits or longer timeouts.

**What I learned:** an agent instructed to make a test pass can also make it pass the wrong way, for example by loosening an assertion. That is why every agent fix needs a review. Agents also rerun tests many times, which quickly hits the demo site's rate limit, so I ran the healer against the one failing test.

The framework is also built to break less often: role-based locators (`getByRole`) survive markup changes, assertions retry while the page loads, and forms report ParaBank's own error text instead of timing out.

## 🏗️ Framework Design

* **Page Object Model (`src/pages/`):** One class per page, extending a shared `BasePage`.
* **Custom fixtures (`src/fixtures/base.fixture.ts`):** `test.extend()` gives each test its Page Objects, the API client and a ready-to-use `customer` (registered, logged in, with a known checking account).
* **API-driven setup (`src/api/ParaBankApi.ts`):** Creates customers, accounts and transfers over HTTP. It uses `page.request`, which shares cookies with the browser, so the page is already logged in after setup.
* **Network interception:** `page.route()` stubs the unreliable bill-pay endpoint and captures the request for assertions.
* **Strict TypeScript & path aliases (`tsconfig.json`):** `@api/*`, `@pages/*`, `@fixtures/*`, `@utils/*`, `@data/*`, `@config/*`.
* **Cross-browser projects:** Chromium, Firefox and WebKit, with traces, screenshots and video kept on failure.
* **CI (`.github/workflows/playwright.yml`):** GitHub Actions type-checks and runs the suite on every push and pull request to `main`, and publishes the HTML report. CI runs Chromium only, to stay within the demo site's rate limit.

## 📂 Project Structure
```text
playwright-fintech-e2e-framework/
├── .claude/agents/                 # Playwright test agents: planner, generator, healer
├── .github/workflows/
│   └── playwright.yml              # GitHub Actions CI workflow
├── specs/                          # Test plans written by the planner agent
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
│   │   ├── bankingE2E.spec.ts      # Five independent banking tests
│   │   └── seed.spec.ts            # Starting point for the agents (skipped in CI)
│   └── utils/
│       └── dataGenerator.ts        # Unique customer profile generator
├── .env.example                    # Environment variable template
├── .mcp.json                       # Lets the agents drive a browser and run tests
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

## 📚 What I Learned

* **Review AI-generated tests as carefully as AI-generated code.** A test can pass and still prove nothing, as the original bill-pay mock did.
* **Independent tests beat one long journey.** Each failure points at one feature, and tests can run in parallel.
* **Set up data through the API, test through the UI.** It keeps tests fast and focused.
* **Shared public test sites have limits.** Rate limiting shaped the CI design.

## 🗺️ Next Steps

* Use the planner and generator agents to draft new tests from written requirements, and review them the same way.
* Move CI from Node 20 (end of life) to Node 22 or 24.
* Tidy the repo: remove the stray `playwright.yml` entry from `.gitignore` and stop tracking the `.tsupgrader/` tool output.
