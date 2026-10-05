import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, assignAllItemsToOnePerson } from './helpers';

// An Unassigned person never blocks Next; they get a note once every Item has a Share.
test('an unassigned person gets a note only once every item is assigned, and Next stays allowed', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');

  await expect(page.getByText(/nothing assigned/)).toHaveCount(0);

  await assignAllItemsToOnePerson(page, 'Alice');

  await expect(page.getByText("Bob has nothing assigned — they'll owe $0.")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});
