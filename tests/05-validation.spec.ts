import { test, expect } from '@playwright/test';

test.describe('Scenario 05: Form Validation', () => {
  test('should display inline validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // Click submit without entering required fields
    await page.click('[data-testid="submit-request-btn"]');

    // Error messages should appear
    await expect(page.locator('[data-testid="error-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-title"]')).toContainText('Title is required');

    await expect(page.locator('[data-testid="error-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-description"]')).toContainText('Description is required');

    // Enter short title (<3 chars)
    await page.fill('[data-testid="request-title-input"]', 'AB');
    await page.click('[data-testid="submit-request-btn"]');
    await expect(page.locator('[data-testid="error-title"]')).toContainText('minimum 3 characters');
  });
});

