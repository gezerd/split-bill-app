import { test, expect } from '@playwright/test';
import { uploadReceipt, addPerson, itemCard, assignAllItemsFullyToOnePerson } from './helpers';

// Regression test for the A1 fix: the Step 2 "Next" button used to only
// check that every item was assigned, never that every added person had
// at least one assignment.
test('Next stays disabled until every added person has an assignment', async ({ page }) => {
  await uploadReceipt(page);
  await addPerson(page, 'Alice');
  await addPerson(page, 'Bob');

  await assignAllItemsFullyToOnePerson(page, 'Alice');

  await expect(page.getByRole('button', { name: '1 people unassigned' })).toBeDisabled();

  // Hand the single-quantity "Cheeseburger" from Alice to Bob so both people
  // end up with at least one assignment.
  const cheeseburgerCard = itemCard(page, 'Cheeseburger');
  await cheeseburgerCard.getByTitle('Alice').click(); // toggles Alice's share off
  await page.waitForLoadState('networkidle');
  await cheeseburgerCard.getByTitle('Bob').click(); // assigns Bob
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('button', { name: 'Next →' })).toBeEnabled();
});
