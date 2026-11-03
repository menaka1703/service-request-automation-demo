import { test, expect } from '@playwright/test';

test.describe('Scenario 01: Create Service Request', () => {
  test.beforeEach(async ({ request }) => {
    // Reset test database to clean state
    await request.post('http://localhost:5000/api/reset');
  });

  test('should successfully create a new service request and redirect to details', async ({ page }) => {
    await page.goto('/');

    // Navigate to Create page
    await page.click('[data-testid="nav-item-create"]');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // Fill form
    const uniqueTitle = `Automated E2E Test Ticket - ${Date.now()}`;
    await page.fill('[data-testid="request-title-input"]', uniqueTitle);
    await page.fill(
      '[data-testid="request-description-input"]',
      'This is an automated test service request created during regression validation.'
    );
    await page.selectOption('[data-testid="request-category-select"]', 'Plumbing');
    await page.selectOption('[data-testid="request-priority-select"]', 'High');

    // Submit form
    await page.click('[data-testid="submit-request-btn"]');

    // Should redirect to details page
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="details-request-title"]')).toHaveText(uniqueTitle);
    await expect(page.locator('[data-testid="details-category-value"]')).toHaveText('Plumbing');
    await expect(page.locator('[data-testid="priority-badge-high"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge-open"]')).toBeVisible();
  });
});
