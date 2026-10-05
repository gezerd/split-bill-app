import { test, expect } from '@playwright/test';
import {
  uploadReceipt,
  addPerson,
  itemCard,
  assignItemToPerson,
  assignAllItemsToOnePerson,
} from './helpers';

// Runs against the real backend with MOCK_OCR=true (see README) — the fixed
// In-N-Out receipt, not a route-intercepted fixture — because downstream
// item/person/assignment calls must resolve against a bill that actually
// exists in the backend's in-memory store.
test('full workflow: upload, assign (including a shared item), tax/tip, breakdown', async ({ page }) => {
  await uploadReceipt(page);

  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');

  // Split the shared "Fry" item (quantity 3) between Alice and Bob
  const friesCard = itemCard(page, 'Fry');
  await friesCard.getByTitle('Bob').click();
  await friesCard.getByTitle('Alice').click();
  await expect(friesCard.getByTestId('status-line')).toHaveText('2 of 3 claimed — Alice & Bob split all 3 evenly');

  // Give everything else to Alice
  await assignAllItemsToOnePerson(page, 'Alice', { except: ['Fry'] });

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next →' }).click();

  await expect(page.getByRole('heading', { name: 'Tax & tip' })).toBeVisible();
  await page.getByRole('button', { name: 'See Breakdown →' }).click();

  await expect(page.getByText('All settled!')).toBeVisible();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  await expect(page.getByText('Bob', { exact: true })).toBeVisible();
});
