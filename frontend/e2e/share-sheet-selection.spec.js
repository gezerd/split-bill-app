import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, itemCard } from './helpers';

const chip = (page, name) => page.getByRole('button', { name: `Select ${name}` });

test('Share sheet −/+ changes Shares and amounts add up to the Item total', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');

  await itemCard(page, 'Cheeseburger').locator('h3').click();
  const sheet = page.getByRole('dialog', { name: 'Shares for Cheeseburger' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Decrease Alice' })).toBeDisabled();

  await sheet.getByRole('button', { name: 'Increase Alice' }).click();
  await sheet.getByRole('button', { name: 'Increase Alice' }).click();
  await sheet.getByRole('button', { name: 'Increase Bob' }).click();
  const amounts = await sheet.getByTestId('share-amount').allTextContents();
  const cents = amounts.map((a) => Math.round(parseFloat(a.replace('$', '')) * 100));
  const total = Math.round(parseFloat((await sheet.getByTestId('sheet-sub').textContent()).match(/\$([\d.]+)/)[1]) * 100);
  expect(cents.reduce((a, b) => a + b, 0)).toBe(total);
  expect(cents[0]).toBeGreaterThan(cents[1]);
  await expect(sheet.getByTestId('sheet-sub')).toContainText('3 shares');

  await sheet.getByRole('button', { name: 'Decrease Bob' }).click();
  await expect(sheet.getByTestId('share-amount').nth(1)).toHaveText('—');
  await expect(sheet.getByRole('button', { name: 'Decrease Bob' })).toBeDisabled();
});

test('Share sheet closes on Done, Esc and backdrop click', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  const sheet = page.getByRole('dialog', { name: 'Shares for Cheeseburger' });
  const card = itemCard(page, 'Cheeseburger');

  await card.locator('h3').click();
  await sheet.getByRole('button', { name: 'Done' }).click();
  await expect(sheet).toHaveCount(0);

  await card.getByRole('button', { name: 'Shares ›' }).click();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);

  await card.locator('h3').click();
  await page.mouse.click(5, 5);
  await expect(sheet).toHaveCount(0);
});

test('selected-person mode: banner, toggling, switching, badge, Done', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice Smith');
  await addPerson(page, 'Bob');
  const burger = itemCard(page, 'Cheeseburger');
  const coke = itemCard(page, 'Med Coke');

  await chip(page, 'Alice Smith').click();
  await expect(page.getByText(/Tapping items for/)).toContainText('Tapping items for Alice Smith. Tap a card to add them to it or take them off.');
  await burger.locator('h3').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(burger.getByTestId('match-badge')).toHaveText('✓ Alice');
  await expect(burger.getByTestId('status-line')).toHaveCount(0);
  await expect(coke).toHaveAttribute('data-focus', 'dim');
  await expect(coke).toHaveCSS('opacity', '0.55');

  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByText(/Tapping items for/)).toHaveCount(0);
  await expect(burger.getByTestId('status-line')).toHaveText('Alice pays');
  await expect(burger).toHaveClass(/border-accent/);

  // Switch between chips; re-tap ends.
  await chip(page, 'Alice Smith').click();
  await chip(page, 'Bob').click();
  await expect(page.getByText(/Tapping items for/)).toContainText('Bob');
  await expect(burger).toHaveAttribute('data-focus', 'dim');
  await coke.locator('h3').click();
  await expect(coke.getByTestId('match-badge')).toHaveText('✓ Bob');
  await chip(page, 'Bob').click();
  await expect(page.getByText(/Tapping items for/)).toHaveCount(0);
});

test('badge shows ×N when the selected Person holds more than one Share', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  const card = itemCard(page, 'Cheeseburger');
  await card.locator('h3').click();
  const sheet = page.getByRole('dialog');
  await sheet.getByRole('button', { name: 'Increase Alice' }).click();
  await sheet.getByRole('button', { name: 'Increase Alice' }).click();
  await sheet.getByRole('button', { name: 'Done' }).click();
  await chip(page, 'Alice').click();
  await expect(card.getByTestId('match-badge')).toHaveText('✓ Alice ×2');
});

test('removing a Person with Shares confirms; Cancel keeps them; no prompt without Shares', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Sam');
  await addPerson(page, 'Jo');
  await itemCard(page, 'Cheeseburger').getByTitle('Sam').click();
  await itemCard(page, 'Med Coke').getByTitle('Sam').click();

  await page.getByRole('button', { name: 'Remove Sam' }).click();
  const dialog = page.getByRole('dialog', { name: 'Remove Sam?' });
  await expect(dialog).toContainText('Their Shares on 2 items will be cleared.');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(chip(page, 'Sam')).toBeVisible();
  await expect(itemCard(page, 'Cheeseburger').getByTestId('status-line')).toHaveText('Sam pays');

  await page.getByRole('button', { name: 'Remove Jo' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(chip(page, 'Jo')).toHaveCount(0);

  // Removing the selected Person ends the selection.
  await chip(page, 'Sam').click();
  await expect(page.getByText(/Tapping items for/)).toBeVisible();
  await page.getByRole('button', { name: 'Remove Sam' }).click();
  await page.getByRole('dialog', { name: 'Remove Sam?' }).getByRole('button', { name: 'Remove' }).click();
  await expect(chip(page, 'Sam')).toHaveCount(0);
  await expect(page.getByText(/Tapping items for/)).toHaveCount(0);
});

test('chip × icon is centred in its round button', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Sam');
  const btn = page.getByRole('button', { name: 'Remove Sam' });
  const b = await btn.boundingBox();
  const i = await btn.locator('svg').boundingBox();
  expect(Math.abs(b.x + b.width / 2 - (i.x + i.width / 2))).toBeLessThan(0.5);
  expect(Math.abs(b.y + b.height / 2 - (i.y + i.height / 2))).toBeLessThan(0.5);
  expect(b.width).toBe(b.height);
});
