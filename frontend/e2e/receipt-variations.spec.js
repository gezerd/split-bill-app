import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8'));
}

// Route-interception based — only checks step 1→2 rendering, never proceeds
// to item/person/assignment calls (the intercepted bill/item ids don't exist
// in the real backend store).
const cases = [
  { file: 'receipt-simple.json', expectItemNames: ['Burger'] },
  { file: 'receipt-shared-item.json', expectItemNames: ['Pizza'] },
  { file: 'receipt-zero-tax-tip.json', expectItemNames: ['Coffee', 'Muffin'] },
  { file: 'receipt-odd-cents.json', expectItemNames: ['Entree'] },
];

for (const { file, expectItemNames } of cases) {
  test(`renders the correct item cards for ${file}`, async ({ page }) => {
    const fixture = loadFixture(file);
    await page.route('**/api/bills/upload-receipt', async (route) => {
      await route.fulfill({ json: fixture });
    });

    await page.goto('/');
    await page.setInputFiles('#receipt-upload', {
      name: 'receipt.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-receipt-bytes'),
    });

    await expect(page.getByText("Who's splitting?")).toBeVisible({ timeout: 5000 });
    for (const name of expectItemNames) {
      await expect(page.locator('h3', { hasText: name })).toBeVisible();
    }
  });
}
