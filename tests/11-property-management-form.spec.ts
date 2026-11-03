import { test, expect } from '@playwright/test';

/**
 * Scenario 11: Property Management Service Request Form
 *
 * Covers the new property-management-specific fields added to the
 * Create Request form:
 *   - Service Category (property management categories)
 *   - Priority (visual card + real select)
 *   - Unit / Apartment Number
 *   - Block / Building
 *   - Floor
 *   - Requester Name
 *   - Contact Number
 *   - Preferred Visit Date
 *   - Allow Entry Without Tenant toggle
 *   - Additional Notes / Special Instructions
 *
 * Also verifies that property context is embedded in the saved description.
 */

test.describe('Scenario 11: Property Management Service Request Form', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/reset');
  });

  test('should create a plumbing request with full property details', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // ── Core request fields ──────────────────────────────────────────
    await page.fill('[data-testid="request-title-input"]', 'Burst Pipe Under Kitchen Sink — Unit 407');
    await page.fill(
      '[data-testid="request-description-input"]',
      'Water is actively leaking from the pipe joint under the kitchen sink. Floor is wet and water is seeping into the cabinet below.'
    );

    // Category: Plumbing
    await page.selectOption('[data-testid="request-category-select"]', 'Plumbing');

    // Priority: Urgent
    await page.selectOption('[data-testid="request-priority-select"]', 'Urgent');

    // ── Property Location fields ─────────────────────────────────────
    await page.fill('[data-testid="property-unit-input"]', '407');
    await page.fill('[data-testid="property-block-input"]', 'Block B');
    await page.fill('[data-testid="property-floor-input"]', '4th Floor');

    // ── Contact & Scheduling fields ──────────────────────────────────
    await page.fill('[data-testid="property-requester-name-input"]', 'Rajesh Kumar');
    await page.fill('[data-testid="property-contact-input"]', '+91 98765 12345');

    // Set preferred visit date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.fill('[data-testid="property-preferred-date-input"]', tomorrowStr);

    // Allow entry: Yes
    await page.click('[data-testid="property-allow-entry-yes-btn"]');

    // Additional notes
    await page.fill('[data-testid="property-notes-input"]', 'Gate code is 1234. Pet (small dog) is inside — please be careful.');

    // ── Submit ───────────────────────────────────────────────────────
    await page.click('[data-testid="submit-request-btn"]');

    // Should navigate to details page
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible({ timeout: 10000 });

    // Verify core fields saved correctly
    await expect(page.locator('[data-testid="details-request-title"]')).toHaveText(
      'Burst Pipe Under Kitchen Sink — Unit 407'
    );
    await expect(page.locator('[data-testid="details-category-value"]')).toHaveText('Plumbing');
    await expect(page.locator('[data-testid="priority-badge-urgent"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge-open"]')).toBeVisible();

    // Verify property context was embedded in the description
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText('Unit: 407');
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText('Block/Building: Block B');
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText('Requester: Rajesh Kumar');
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText('Contact: +91 98765 12345');
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText('Entry Without Tenant: Yes');
  });

  test('should create a maintenance request and verify all property management categories exist', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // Verify all 12 property management categories are available
    const expectedCategories = [
      'Maintenance & Repairs',
      'Plumbing',
      'Electrical',
      'HVAC & Air Conditioning',
      'Cleaning & Housekeeping',
      'Security & Access',
      'Pest Control',
      'Landscaping & Grounds',
      'Parking & Vehicles',
      'Lease & Tenancy',
      'Move In / Move Out',
      'Common Areas & Amenities',
    ];

    for (const cat of expectedCategories) {
      await expect(page.locator(`[data-testid="request-category-select"] option[value="${cat}"]`)).toBeTruthy();
    }

    // Fill a maintenance request
    await page.fill('[data-testid="request-title-input"]', 'Cracked Wall Tiles in Bathroom — Unit 215');
    await page.fill(
      '[data-testid="request-description-input"]',
      'Bathroom wall tiles have multiple cracks and grout is deteriorating causing possible water seepage.'
    );
    await page.selectOption('[data-testid="request-category-select"]', 'Maintenance & Repairs');
    await page.selectOption('[data-testid="request-priority-select"]', 'Medium');

    // Property details
    await page.fill('[data-testid="property-unit-input"]', '215');
    await page.fill('[data-testid="property-block-input"]', 'Tower A');
    await page.fill('[data-testid="property-contact-input"]', '+91 99887 66554');

    // Allow entry: No
    await page.click('[data-testid="property-allow-entry-no-btn"]');

    await page.click('[data-testid="submit-request-btn"]');

    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="details-category-value"]')).toHaveText('Maintenance & Repairs');
    await expect(page.locator('[data-testid="priority-badge-medium"]')).toBeVisible();

    // Verify "No entry" preference saved
    await expect(page.locator('[data-testid="details-request-description"]')).toContainText(
      'Entry Without Tenant: No'
    );
  });

  test('should validate required fields on property management form', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // Click submit without filling anything
    await page.click('[data-testid="submit-request-btn"]');

    // Title and description errors must show
    await expect(page.locator('[data-testid="error-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-description"]')).toBeVisible();

    // Fill only title — description error should still show
    await page.fill('[data-testid="request-title-input"]', 'Leaking Pipe');
    await page.click('[data-testid="submit-request-btn"]');
    await expect(page.locator('[data-testid="error-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-title"]')).not.toBeVisible();

    // Fill description — errors should clear and form submits
    await page.fill('[data-testid="request-description-input"]', 'Water is leaking from the bathroom pipe.');
    await page.click('[data-testid="submit-request-btn"]');
    await expect(page.locator('[data-testid="request-details-page"]')).toBeVisible({ timeout: 10000 });
  });

  test('should reset form and clear all property fields', async ({ page }) => {
    await page.goto('/#/create');
    await expect(page.locator('[data-testid="create-request-page"]')).toBeVisible();

    // Fill some fields
    await page.fill('[data-testid="request-title-input"]', 'Test Title to be Reset');
    await page.fill('[data-testid="request-description-input"]', 'Test description');
    await page.fill('[data-testid="property-unit-input"]', '999');
    await page.fill('[data-testid="property-requester-name-input"]', 'Test User');

    // Click Reset Form
    await page.click('button:has-text("Reset Form")');

    // All fields should be cleared
    await expect(page.locator('[data-testid="request-title-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="request-description-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="property-unit-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="property-requester-name-input"]')).toHaveValue('');
  });
});
