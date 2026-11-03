import { test, expect } from '@playwright/test';

test.describe('Scenario 06: Search & Multi-Filters', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should search by keyword and filter by status and priority', async ({ page }) => {
    await page.goto('/#/requests');
    await expect(page.locator('[data-testid="requests-table"]')).toBeVisible();

    // 1. Search by keyword "Electrical" — matches REQ-2026-003
    await page.fill('[data-testid="search-input"]', 'Electrical');
    await expect(page.locator('[data-testid="request-row-REQ-2026-003"]')).toBeVisible();

    // Clear search
    await page.click('[data-testid="clear-filters-btn"]');
    await expect(page.locator('[data-testid="request-row-REQ-2026-003"]')).toBeVisible();

    // 2. Filter by Status = "Completed"
    await page.selectOption('[data-testid="status-filter-select"]', 'Completed');
    await expect(page.locator('[data-testid="status-badge-completed"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="status-badge-open"]')).not.toBeVisible();

    // 3. Filter by Priority = "Medium" while Status = "Completed"
    await page.selectOption('[data-testid="priority-filter-select"]', 'Medium');
    await expect(page.locator('[data-testid="priority-badge-medium"]').first()).toBeVisible();

    // 4. Reset filters
    await page.click('[data-testid="clear-filters-btn"]');
    await expect(page.locator('[data-testid="status-filter-select"]')).toHaveValue('All');
    await expect(page.locator('[data-testid="priority-filter-select"]')).toHaveValue('All');
    await expect(page.locator('[data-testid="request-row-REQ-2026-003"]')).toBeVisible();
  });
});
