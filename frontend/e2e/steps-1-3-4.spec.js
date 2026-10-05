import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, itemCard, assignAllItemsToOnePerson } from './helpers';

const fileInput = { name: 'receipt.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') };

test('manual entry starts an empty bill on Step 2 with no mismatch banner', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter items manually' }).click();
  await expect(page.getByText("Who's splitting?")).toBeVisible();
  await expect(page.locator('h3')).toHaveCount(0);
  await expect(page.getByText(/Items add up to/)).toHaveCount(0);
});

test('a failed upload shows an inline error with retry, not an alert', async ({ page }) => {
  let dialogs = 0;
  page.on('dialog', (d) => { dialogs += 1; d.dismiss(); });
  await page.route('**/api/bills/upload-receipt', (route) => route.fulfill({ status: 500, json: { detail: 'nope' } }));
  await page.goto('/');
  await page.setInputFiles('#receipt-upload', fileInput);
  await expect(page.getByRole('alert')).toContainText("Couldn't read that receipt");
  await expect(page.getByText('Try again', { exact: true })).toBeVisible();
  expect(dialogs).toBe(0);

  await page.unroute('**/api/bills/upload-receipt');
  await page.setInputFiles('#receipt-upload', fileInput);
  await expect(page.getByText("Who's splitting?")).toBeVisible();
});

test('Continue with current bill returns to Step 2 with everything intact', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await itemCard(page, 'Med Coke').getByTitle('Alice').click();
  await page.getByRole('button', { name: '← Back' }).click();
  await page.getByRole('button', { name: 'Continue with current bill →' }).click();
  await expect(page.getByText("Who's splitting?")).toBeVisible();
  await expect(itemCard(page, 'Med Coke').getByTestId('status-line')).toHaveText('Alice pays');
});

test('replacing the receipt asks only when there is something to lose, and keeps people', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');

  // Nothing to lose: no prompt
  await page.getByRole('button', { name: '← Back' }).click();
  await page.setInputFiles('#receipt-upload', fileInput);
  await expect(page.getByText("Who's splitting?")).toBeVisible();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();

  // Now there are assignments
  await itemCard(page, 'Med Coke').getByTitle('Alice').click();
  await page.getByRole('button', { name: '← Back' }).click();
  await page.setInputFiles('#receipt-upload', fileInput);
  await expect(page.getByRole('dialog', { name: 'Replace receipt?' })).toContainText('People are kept.');

  // Cancel keeps everything
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Continue with current bill →' }).click();
  await expect(itemCard(page, 'Med Coke').getByTestId('status-line')).toHaveText('Alice pays');

  // Confirm clears assignments, keeps people
  await page.getByRole('button', { name: '← Back' }).click();
  await page.setInputFiles('#receipt-upload', fileInput);
  await page.getByRole('button', { name: 'Replace' }).click();
  await expect(page.getByText("Who's splitting?")).toBeVisible();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  await expect(itemCard(page, 'Med Coke').getByTestId('status-line')).toHaveText('Tap a person to assign');
});

test('Step 3 subtotal follows an item edit, matches Step 4; tax shows its percentage', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await assignAllItemsToOnePerson(page, 'Alice');

  await itemCard(page, 'Med Coke').getByTitle('Edit item').click();
  await page.getByPlaceholder('0.00').fill('3.30');
  await page.getByRole('button', { name: /Save/ }).click();

  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByText('$50.80', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Items add up to \$50.80, but the receipt subtotal is \$49.80/)).toBeVisible();
  await expect(page.getByText(/≈ \d+\.\d%/)).toBeVisible();

  // Tax and custom tip: plain text fields that reject invalid input
  const tax = page.getByLabel('Tax');
  await expect(tax).toHaveAttribute('type', 'text');
  await tax.fill('');
  await tax.pressSequentially('1a2.345');
  await expect(tax).toHaveValue('12.34');
  await tax.blur();
  await expect(page.getByText('Processing...')).toHaveCount(0);

  await page.getByRole('button', { name: 'See Breakdown →' }).click();
  await page.getByRole('button', { name: 'Receipt', exact: true }).click();
  await expect(page.getByText('SUBTOTAL', { exact: true }).locator('xpath=following-sibling::span')).toHaveText('$50.80');
});

test('Copy summary copies totals only; Start New Bill confirms and resets in place', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');
  await assignAllItemsToOnePerson(page, 'Alice', { except: ['Fry'] });
  await itemCard(page, 'Fry').getByTitle('Bob').click();
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'See Breakdown →' }).click();
  await expect(page.getByText('All settled!')).toBeVisible();

  await page.getByRole('button', { name: 'Copy summary' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  const lines = text.split('\n');
  expect(lines[0]).toMatch(/^Split — \$\d+\.\d\d$/);
  expect(lines).toHaveLength(3);
  expect(lines[1]).toMatch(/^Alice {2}\$\d+\.\d\d$/);
  expect(lines[2]).toMatch(/^Bob {4}\$\d+\.\d\d$/);

  // No reload: a marker on window survives
  await page.evaluate(() => { window.__marker = 1; });
  await page.getByRole('button', { name: 'Start New Bill', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('All settled!')).toBeVisible();

  await page.getByRole('button', { name: 'Start New Bill', exact: true }).click();
  await page.getByRole('button', { name: 'Start new bill', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Split the bill.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with current bill →' })).toHaveCount(0);
  expect(await page.evaluate(() => window.__marker)).toBe(1);
});

test('the leave warning is active only while a bill exists', async ({ page }) => {
  const warns = () => page.evaluate(() => {
    const e = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(e);
    return e.defaultPrevented;
  });
  await page.goto('/');
  expect(await warns()).toBe(false);
  await page.setInputFiles('#receipt-upload', fileInput);
  await expect(page.getByText("Who's splitting?")).toBeVisible();
  expect(await warns()).toBe(true);
});
