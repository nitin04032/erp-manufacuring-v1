import { test, expect } from '@playwright/test';

test('dashboard page', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://localhost:3000/dashboard');
  await page.screenshot({ path: 'dashboard.png' });
});
