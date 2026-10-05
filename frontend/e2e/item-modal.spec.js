import { test, expect } from '@playwright/test';
import { uploadReceipt, itemCard } from './helpers';

async function openAddModal(page) {
  await page.getByRole('button', { name: /Add missing item/ }).click();
  await expect(page.getByRole('dialog', { name: 'Add an item' })).toBeVisible();
}

test('add modal validates name and price and shows the item total', async ({ page }) => {
  await uploadReceipt(page);
  await openAddModal(page);

  const submit = page.getByRole('button', { name: /^Add item/ });
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveText('Add item');

  await page.getByLabel('Item name').fill('Ranch');
  await expect(submit).toBeDisabled();

  await page.getByLabel('Price per item').fill('0');
  await expect(submit).toBeDisabled();

  await page.getByLabel('Price per item').fill('1.25');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveText('Add item · $2.50');

  await page.getByLabel('Item name').fill('   ');
  await expect(submit).toBeDisabled();
});

test('price field filters input and has no spinner', async ({ page }) => {
  await uploadReceipt(page);
  await openAddModal(page);

  const price = page.getByLabel('Price per item');
  await expect(price).toHaveAttribute('type', 'text');
  await expect(price).toHaveAttribute('inputmode', 'decimal');

  await price.pressSequentially('a1b2.3.456');
  await expect(price).toHaveValue('12.34');
});

test('modifiers added with Enter persist on the card and survive an edit', async ({ page }) => {
  await uploadReceipt(page);
  await openAddModal(page);

  // Enter adds a modifier even while the form is invalid
  const mod = page.getByLabel(/Modifiers/);
  await mod.fill('Extra ranch');
  await mod.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove Extra ranch' })).toBeVisible();
  await expect(mod).toHaveValue('');

  await page.getByLabel('Item name').fill('Nuggets');
  await page.getByLabel('Price per item').fill('5');
  await page.getByRole('button', { name: 'Add item · $5.00' }).click();

  await expect(itemCard(page, 'Nuggets').getByText('Extra ranch')).toBeVisible();

  await itemCard(page, 'Nuggets').getByTitle('Edit item').click();
  await page.getByLabel(/Modifiers/).fill('Spicy');
  await page.getByLabel(/Modifiers/).press('Enter');
  await page.getByRole('button', { name: /^Save · \$5.00/ }).click();

  const card = itemCard(page, 'Nuggets');
  await expect(card.getByText('Extra ranch')).toBeVisible();
  await expect(card.getByText('Spicy')).toBeVisible();

  // Removing a tag in edit persists too
  await card.getByTitle('Edit item').click();
  await page.getByRole('button', { name: 'Remove Extra ranch' }).click();
  await page.getByRole('button', { name: /^Save/ }).click();
  await expect(itemCard(page, 'Nuggets').getByText('Extra ranch')).toHaveCount(0);
  await expect(itemCard(page, 'Nuggets').getByText('Spicy')).toBeVisible();
});

test('Esc and backdrop click close the modal', async ({ page }) => {
  await uploadReceipt(page);
  const dialog = page.getByRole('dialog', { name: 'Add an item' });

  await openAddModal(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await openAddModal(page);
  await page.mouse.click(5, 5);
  await expect(dialog).toHaveCount(0);
});

test('delete asks for confirmation naming the item; Cancel keeps it', async ({ page }) => {
  await uploadReceipt(page);
  await itemCard(page, 'Med Coke').getByTitle('Delete item').click();

  const dialog = page.getByRole('dialog', { name: 'Delete item?' });
  await expect(dialog.locator('strong')).toHaveText('Med Coke');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('h3', { hasText: 'Med Coke' })).toHaveCount(1);

  await itemCard(page, 'Med Coke').getByTitle('Delete item').click();
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('h3', { hasText: 'Med Coke' })).toHaveCount(0);
});
