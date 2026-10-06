import { test, expect } from '@playwright/test';
import {
  uploadReceipt,
  addPerson,
  itemCard,
  assignItemToPerson,
  assignAllItemsToOnePerson,
} from './helpers';

test('deleting a fully-assigned item keeps gating consistent (no orphaned remaining count)', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await assignAllItemsToOnePerson(page, 'Alice');

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();

  await itemCard(page, 'Cheeseburger').getByTitle('Delete item').click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('h3', { hasText: 'Cheeseburger' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});

test('editing an unassigned item preserves the correct remaining count after assignment', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');

  const cardCount = await page.locator('h3').count();
  for (let i = 0; i < cardCount; i++) {
    const heading = page.locator('h3').nth(i);
    const name = await heading.textContent();
    if (name === 'Med Coke') continue;
    const card = heading.locator('xpath=ancestor::div[contains(@class,"bg-surface")][1]');
    await assignItemToPerson(card, 'Alice');
  }

  await expect(page.getByRole('button', { name: '1 items remaining' })).toBeDisabled();

  const medCokeCard = itemCard(page, 'Med Coke');
  await medCokeCard.getByTitle('Edit item').click();
  await page.getByRole('button', { name: /Save/ }).click();

  await itemCard(page, 'Med Coke').getByTitle('Alice').click();

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});

test('deleting a line makes the subtotal mismatch banner appear', async ({ page }) => {
  await uploadReceipt(page);
  await expect(page.getByText(/Items add up to/)).toHaveCount(0);

  await itemCard(page, 'Cheeseburger').getByTitle('Delete item').click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText(/Items add up to \$45.55, but the receipt subtotal is \$49.80/)).toBeVisible();
});

test('editing a line price makes the subtotal mismatch banner appear', async ({ page }) => {
  await uploadReceipt(page);

  await itemCard(page, 'Med Coke').getByTitle('Edit item').click();
  await page.getByPlaceholder('0.00').fill('3.30');
  await page.getByRole('button', { name: /Save/ }).click();

  await expect(page.getByText(/Items add up to \$50.80, but the receipt subtotal is \$49.80/)).toBeVisible();
});
