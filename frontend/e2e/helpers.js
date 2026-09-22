import { expect } from '@playwright/test';

export async function uploadReceipt(page) {
  await page.goto('/');
  await page.setInputFiles('#receipt-upload', {
    name: 'receipt.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-receipt-bytes'),
  });
  await expect(page.getByText("Who's splitting?")).toBeVisible({ timeout: 5000 });
}

export async function addPerson(page, name) {
  await page.getByPlaceholder('Enter a name…').fill(name);
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Exact match — plain substring matching would also match e.g. "Fry" inside "Animal Fry".
export function itemCard(page, itemName) {
  return page
    .locator('h3', { hasText: new RegExp(`^${escapeRegExp(itemName)}$`) })
    .locator('xpath=ancestor::div[contains(@class,"bg-surface")][1]');
}

// Every avatar click re-saves the item's whole assignment map (App's
// handleAssignmentSave deletes all of the item's existing assignments, then
// re-creates each one) — a sequential chain of awaited API calls, not a
// single request. Clicking again before that chain lands re-reads stale
// props and can toggle a share back off, so each click must be clicked
// exactly once and fully settled (network idle) before the next one.
export async function assignItemFullyToPerson(page, card, personName) {
  const hintLocator = card.getByText(/^×\d+ @/);
  const hintCount = await hintLocator.count();
  const quantity = hintCount > 0
    ? parseInt((await hintLocator.first().textContent()).match(/×(\d+)/)[1], 10)
    : 1;

  const sharesLabel = card.getByText(/^\d+ shares?$/);
  const sharesCount = await sharesLabel.count();
  const currentShares = sharesCount > 0
    ? parseInt((await sharesLabel.first().textContent()).match(/^(\d+)/)[1], 10)
    : 0;

  const clicksNeeded = quantity - currentShares;
  const avatarBtn = card.getByTitle(personName);
  for (let i = 0; i < clicksNeeded; i++) {
    await avatarBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

export async function assignAllItemsFullyToOnePerson(page, personName) {
  const cardCount = await page.locator('h3').count();
  for (let i = 0; i < cardCount; i++) {
    const heading = page.locator('h3').nth(i);
    const card = heading.locator('xpath=ancestor::div[contains(@class,"bg-surface")][1]');
    await assignItemFullyToPerson(page, card, personName);
  }
}
