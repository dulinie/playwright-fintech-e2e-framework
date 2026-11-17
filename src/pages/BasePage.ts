import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates relative to `use.baseURL` (from BASE_URL). Keep paths relative with no
   * leading slash, e.g. 'index.htm' — a leading '/' would drop the '/parabank/' segment.
   */
  async navigateTo(path: string = 'index.htm'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Waits for either the success panel or the error panel of a ParaBank form, and throws
   * a descriptive error if the error panel is shown (rather than timing out on the result).
   */
  protected async waitForResultOrError(
    result: Locator,
    error: Locator,
    action: string,
  ): Promise<void> {
    await result.or(error).first().waitFor({ state: 'visible' });

    if (await error.isVisible()) {
      throw new Error(`${action} failed: ${(await error.innerText()).trim()}`);
    }
  }
}
