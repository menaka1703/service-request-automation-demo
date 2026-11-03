import { test, expect } from '@playwright/test';

test.describe('Scenario 07: Pagination Controls', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should navigate between pages and display correct pagination meta', async ({ page }) => {
    await page.goto('/#/requests');
    await expect(page.locator('[data-testid="requests-table"]')).toBeVisible();

    // Verify pagination controls are visible
    const info = page.locator('[data-testid="pagination-info"]');
    await expect(info).toBeVisible();
    await expect(info).toContainText('Page 1 of');

    const prevBtn = page.locator('[data-testid="pagination-prev-btn"]');
    const nextBtn = page.locator('[data-testid="pagination-next-btn"]');

    // Previous should be disabled on first page
    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    // Click Next
    await nextBtn.click();
    await expect(info).toContainText('Page 2 of');
    await expect(prevBtn).toBeEnabled();

    // Click Prev
    await prevBtn.click();
    await expect(info).toContainText('Page 1 of');
  });
});

