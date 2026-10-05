import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, itemCard, assignAllItemsToOnePerson } from './helpers';

test('avatar tap toggles a Person on and off', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');

  const card = itemCard(page, 'Cheeseburger');
  await expect(card.getByTestId('status-line')).toHaveText('Tap a person to assign');

  await card.getByTitle('Alice').click();
  await expect(card.getByTestId('status-line')).toHaveText('Alice pays');

  await card.getByTitle('Alice').click();
  await expect(card.getByTestId('status-line')).toHaveText('Tap a person to assign');
});

test('rapid taps end in the saved state matching the screen', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');

  const card = itemCard(page, 'Cheeseburger');
  for (let i = 0; i < 5; i++) await card.getByTitle('Alice').click();
  await expect(card.getByTestId('status-line')).toHaveText('Alice pays');
  await expect(page.getByText('Processing...')).toHaveCount(0);

  // Let the writes land, then reload-free check via Step 4.
  await page.waitForLoadState('networkidle');
  await assignAllItemsToOnePerson(page, 'Alice', { except: ['Cheeseburger'] });
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'See Breakdown →' }).click();
  await expect(page.getByText('Cheeseburger').first()).toBeVisible();
});

test('several people share a quantity-1 item and Step 4 matches the card', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');

  const card = itemCard(page, 'Cheeseburger');
  await card.getByTitle('Alice').click();
  await card.getByTitle('Bob').click();
  await expect(card.getByTestId('status-line')).toHaveText('Split 2 ways · ~$2.13 each');

  await assignAllItemsToOnePerson(page, 'Alice', { except: ['Cheeseburger'] });
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'See Breakdown →' }).click();
  await expect(page.getByText('Cheeseburger').first()).toBeVisible();
  await expect(page.getByText('$2.13').first()).toBeVisible();
  await expect(page.getByText('$2.12').first()).toBeVisible();
});

test('partial item warns in amber and Next stays allowed', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await assignAllItemsToOnePerson(page, 'Alice');

  const fries = itemCard(page, 'Animal Fry');
  await expect(fries.getByTestId('status-line')).toHaveText('1 of 2 claimed — Alice covers all 2');
  await expect(fries).toHaveClass(/border-\[#FBBF24\]/);
  await expect(page.getByText(/\d+ partial/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});

test('Next counts remaining unassigned items', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await expect(page.getByRole('button', { name: '9 items remaining' })).toBeDisabled();

  await itemCard(page, 'Med Coke').getByTitle('Alice').click();
  await expect(page.getByRole('button', { name: '8 items remaining' })).toBeDisabled();
});
