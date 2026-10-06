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

// Avatar taps are optimistic and serialised, so a tap needs no waiting.
// A tap toggles ×1 on/off: call this on an Item the Person doesn't hold yet.
export async function assignItemToPerson(card, personName) {
  await card.getByTitle(personName).click();
}

export async function assignAllItemsToOnePerson(page, personName, { except = [] } = {}) {
  const cardCount = await page.locator('h3').count();
  for (let i = 0; i < cardCount; i++) {
    const heading = page.locator('h3').nth(i);
    if (except.includes(await heading.textContent())) continue;
    const card = heading.locator('xpath=ancestor::div[contains(@class,"bg-surface")][1]');
    await assignItemToPerson(card, personName);
  }
}
