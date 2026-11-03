import { test, expect } from '@playwright/test';

test.describe('Scenario 04: Delete Service Request', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should prompt confirmation modal and delete a request', async ({ page }) => {
    await page.goto('/#/requests');
    await expect(page.locator('[data-testid="requests-table"]')).toBeVisible();

    // Verify REQ-2026-003 exists before deletion
    await expect(page.locator('[data-testid="request-row-REQ-2026-003"]')).toBeVisible();

    // Click delete button
    await page.click('[data-testid="delete-btn-REQ-2026-003"]');

    // Confirm modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-modal-action-btn"]');

    // Verify REQ-2026-003 is removed from the table
    await expect(page.locator('[data-testid="request-row-REQ-2026-003"]')).not.toBeVisible();
  });
});

