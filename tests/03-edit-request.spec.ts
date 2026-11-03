import { test, expect } from '@playwright/test';

test.describe('Scenario 03: Edit Service Request', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should edit and update request title and description', async ({ page }) => {
    // REQ-2026-002 = "Air Conditioning Not Cooling — Block A, Unit 312" (HVAC, High, Open)
    await page.goto('/#/requests/REQ-2026-002');
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible();

    // Click Edit button
    await page.click('[data-testid="edit-request-btn"]');
    await expect(page.locator('[data-testid="edit-request-form"]')).toBeVisible();

    // Update title and description
    const updatedTitle = 'AC Unit Compressor Failure — Block A Unit 312 (Updated by Playwright)';
    await page.fill('[data-testid="edit-title-input"]', updatedTitle);
    await page.fill('[data-testid="edit-description-input"]', 'Refrigerant leak confirmed — compressor replacement scheduled.');
    await page.selectOption('[data-testid="edit-priority-select"]', 'Urgent');

    // Save
    await page.click('[data-testid="save-request-btn"]');

    // Verify view mode displays updated values
    await expect(page.locator('[data-testid="details-request-title"]')).toHaveText(updatedTitle);
    await expect(page.locator('[data-testid="priority-badge-urgent"]')).toBeVisible();
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText(
      'Refrigerant leak confirmed'
    );
  });
});
