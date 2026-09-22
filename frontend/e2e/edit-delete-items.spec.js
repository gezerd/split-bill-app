import { test, expect } from '@playwright/test';
import {
  uploadReceipt,
  addPerson,
  itemCard,
  assignItemFullyToPerson,
  assignAllItemsFullyToOnePerson,
} from './helpers';

test('deleting a fully-assigned item keeps gating consistent (no orphaned remaining count)', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await assignAllItemsFullyToOnePerson(page, 'Alice');

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
    await assignItemFullyToPerson(page, card, 'Alice');
  }

  await expect(page.getByRole('button', { name: '1 items remaining' })).toBeDisabled();

  const medCokeCard = itemCard(page, 'Med Coke');
  await medCokeCard.getByTitle('Edit item').click();
  await page.getByRole('button', { name: /Save/ }).click();

  await itemCard(page, 'Med Coke').getByTitle('Alice').click();

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});
