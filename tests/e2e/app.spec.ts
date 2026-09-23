import { expect, test } from '@playwright/test';

test('desktop smoke: calculator, result, diagrams, and share action are visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /find a location from a solar-noon observation/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /your solar-noon observation/i })).toBeVisible();
  await expect(page.getByText(/37\.45° S, 145\.22° E/i)).toBeVisible();
  await expect(page.getByRole('img', { name: /latitude diagram/i })).toBeVisible();
  await expect(page.getByRole('img', { name: /longitude diagram/i })).toBeVisible();
  await expect(page.getByRole('img', { name: /earth context globe/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /copy share link/i })).toBeVisible();
});

test('mobile 320: core calculator works without horizontal page scroll', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /find a location from a solar-noon observation/i })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: /solar altitude at noon/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /calculate location/i })).toBeVisible();

  const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalScroll).toBe(false);
});
