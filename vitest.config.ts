/**
 * Play-тесты историй Storybook в настоящем браузере (headless Chromium): `npm run test-storybook`.
 * Каждая история рендерится как тест; `play` — его тело. Упала `expect` / исключение / console.error в React → тест красный.
 * Локально без скачанного браузера Playwright: CHROME_PATH=/путь/к/chromium npm run test-storybook.
 */
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { executablePath: process.env.CHROME_PATH || undefined } }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
