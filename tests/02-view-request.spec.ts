import { test, expect } from '@playwright/test';

test.describe('Scenario 02: View Service Request Details', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should inspect details of an existing service request', async ({ page }) => {
    await page.goto('/#/requests');
    await expect(page.locator('[data-testid="requests-table"]')).toBeVisible();

    // Verify and click on REQ-2026-003 (present on page 1)
    // REQ-2026-003 = "Electrical Short Circuit Tripping Main Breaker — Unit 510" (Electrical, Urgent, Open)
    const row = page.locator('[data-testid="request-row-REQ-2026-003"]');
    await expect(row).toBeVisible();
    await page.click('[data-testid="view-btn-REQ-2026-003"]');

    // Verify Details Page loads with accurate metadata
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="details-request-id"]')).toHaveText('REQ-2026-003');
    await expect(page.locator('[data-testid="details-request-title"]')).toContainText('Electrical Short Circuit');
    await expect(page.locator('[data-testid="details-category-value"]')).toHaveText('Electrical');

    // Click back to requests
    await page.click('[data-testid="back-to-requests-btn"]');
    await expect(page.locator('[data-testid="requests-list-page"]')).toBeVisible();
  });
});
