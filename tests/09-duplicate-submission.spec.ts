import { test, expect } from '@playwright/test';

test.describe('Scenario 09: Duplicate Submission Prevention with Idempotency-Key', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should return existing record when same idempotency key is submitted twice', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    const idempotencyKey = `e2e-idemp-${Date.now()}`;

    // Fill form
    await page.fill('[data-testid="request-title-input"]', 'Basement Parking Drain Blockage');
    await page.fill(
      '[data-testid="request-description-input"]',
      'Water pooling near basement parking bay P2-14 due to blocked storm drain.'
    );
    await page.fill('[data-testid="idempotency-key-input"]', idempotencyKey);

    // Submit 1st time
    await page.click('[data-testid="submit-request-btn"]');
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible();
    const createdId = await page.locator('[data-testid="details-request-id"]').innerText();

    // Now attempt duplicate submission with SAME Idempotency-Key
    await page.goto('/#/create');
    await page.fill('[data-testid="request-title-input"]', 'Duplicate Attempt Drain Blockage');
    await page.fill(
      '[data-testid="request-description-input"]',
      'This payload has slightly different text but the identical idempotency key.'
    );
    await page.fill('[data-testid="idempotency-key-input"]', idempotencyKey);

    // Submit 2nd time
    await page.click('[data-testid="submit-request-btn"]');

    // Should detect idempotency replay and redirect back to the original request without creating a duplicate!
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible();
    const replayedId = await page.locator('[data-testid="details-request-id"]').innerText();
    expect(replayedId).toBe(createdId);
  });
});

