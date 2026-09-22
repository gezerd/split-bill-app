import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, itemCard, assignItemFullyToPerson } from './helpers';

test('partially assigned items keep Next disabled with the correct remaining count', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');

  // Assign every item except the single-quantity "Med Coke"
  const cardCount = await page.locator('h3').count();
  for (let i = 0; i < cardCount; i++) {
    const heading = page.locator('h3').nth(i);
    const name = await heading.textContent();
    if (name === 'Med Coke') continue;
    const card = heading.locator('xpath=ancestor::div[contains(@class,"bg-surface")][1]');
    await assignItemFullyToPerson(page, card, 'Alice');
  }

  await expect(page.getByRole('button', { name: '1 items remaining' })).toBeDisabled();

  await itemCard(page, 'Med Coke').getByTitle('Alice').click();

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});
