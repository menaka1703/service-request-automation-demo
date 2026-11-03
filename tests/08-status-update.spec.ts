import { test, expect } from '@playwright/test';

test.describe('Scenario 08: Status Update Transitions', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should update status via details transition buttons and table dropdown', async ({ page }) => {
    // 1. Update from Request Details page
    await page.goto('/#/requests/REQ-2026-003');
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge-open"]')).toBeVisible();

    // Click transition to "In Progress"
    await page.click('[data-testid="transition-to-in-progress"]');
    await expect(page.locator('[data-testid="status-badge-in-progress"]')).toBeVisible();

    // 2. Quick status update from Table dropdown
    await page.goto('/#/requests');
    await expect(page.locator('[data-testid="requests-table"]')).toBeVisible();

    // Change status of REQ-2026-003 to "Completed"
    await page.selectOption('[data-testid="quick-status-REQ-2026-003"]', 'Completed');

    // Verify row has Completed badge
    const row = page.locator('[data-testid="request-row-REQ-2026-003"]');
    await expect(row.locator('[data-testid="status-badge-completed"]')).toBeVisible();
  });
});

