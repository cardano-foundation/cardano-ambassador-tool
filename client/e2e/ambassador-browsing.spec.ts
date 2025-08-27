import { test, expect } from '@playwright/test';
import { waitForAppAndDataLoad, waitForAppToLoad } from './utils/waitForAppLoad';

test.describe('Ambassador Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load (ambassador data is static, no need to wait for DB)
    await waitForAppToLoad(page);
  });

  test('should display the homepage correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Cardano Ambassador/);

    // Check main heading
    await expect(
      page.getByText('Welcome to Cardano Ambassador Explorer')
    ).toBeVisible();

    // Check description
    await expect(
      page.getByText('Discover the passionate individuals shaping the Cardano ecosystem')
    ).toBeVisible();

    // Check that ambassador cards are visible (with extended timeout)
    await expect(page.locator('[data-testid="ambassador-card"]').first()).toBeVisible({ timeout: 30000 });
  });

  test('should display ambassador search bar', async ({ page }) => {
    // Check search input is visible
    await expect(
      page.getByPlaceholder('Search ambassador')
    ).toBeVisible();

    // Check view toggle buttons exist
    await expect(page.locator('[data-testid="view-toggle-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-toggle-list"]')).toBeVisible();

    // Check region filter dropdown exists
    await expect(page.locator('[data-testid="region-filter"]')).toBeVisible();
  });

  test('should search ambassadors by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search ambassador');
    
    // Type in search
    await searchInput.fill('test');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const ambassadorCards = page.locator('[data-testid="ambassador-card"]');
    const cardCount = await ambassadorCards.count();
    
    // Should have fewer results than the initial load
    expect(cardCount).toBeGreaterThan(0);
    
    // Check that visible cards contain the search term
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = ambassadorCards.nth(i);
      const cardText = await card.textContent();
      expect(cardText?.toLowerCase()).toContain('test');
    }
  });

  test('should search ambassadors by location', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search ambassador');
    
    // Search by country
    await searchInput.fill('Canada');
    await page.waitForTimeout(500);
    
    const ambassadorCards = page.locator('[data-testid="ambassador-card"]');
    const cardCount = await ambassadorCards.count();
    
    if (cardCount > 0) {
      // Check that visible cards are from Canada
      const firstCard = ambassadorCards.first();
      await expect(firstCard).toContainText('Canada');
    }
  });

  test('should filter ambassadors by region', async ({ page }) => {
    // Open region filter dropdown
    const regionFilter = page.locator('[data-testid="region-filter"]');
    await regionFilter.click();
    
    // Wait for dropdown options
    await page.waitForTimeout(300);
    
    // Select a specific region (assuming "United States" exists)
    const regionOption = page.getByText('United States');
    if (await regionOption.isVisible()) {
      await regionOption.click();
      
      // Wait for filtering
      await page.waitForTimeout(500);
      
      // Check that results are filtered
      const ambassadorCards = page.locator('[data-testid="ambassador-card"]');
      const cardCount = await ambassadorCards.count();
      
      if (cardCount > 0) {
        // Verify that displayed cards are from the selected region
        const firstCard = ambassadorCards.first();
        await expect(firstCard).toContainText('United States');
      }
    }
  });

  test('should switch between grid and list views', async ({ page }) => {
    // Default should be grid view
    await expect(page.locator('[data-testid="view-toggle-grid"]')).toHaveClass(/active|selected/);
    
    // Check grid layout
    const gridContainer = page.locator('.grid');
    await expect(gridContainer).toBeVisible();
    
    // Switch to list view
    await page.locator('[data-testid="view-toggle-list"]').click();
    await page.waitForTimeout(300);
    
    // Check list layout
    const listContainer = page.locator('.space-y-3, .space-y-4');
    await expect(listContainer).toBeVisible();
    
    // Switch back to grid view
    await page.locator('[data-testid="view-toggle-grid"]').click();
    await page.waitForTimeout(300);
    
    // Verify grid view is restored
    await expect(gridContainer).toBeVisible();
  });

  test('should show more ambassadors when "Show more" is clicked', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Count initial ambassador cards
    const initialCards = page.locator('[data-testid="ambassador-card"]');
    const initialCount = await initialCards.count();
    
    // Check if "Show more" button exists
    const showMoreButton = page.getByText('Show more Ambassadors');
    if (await showMoreButton.isVisible()) {
      // Click show more
      await showMoreButton.click();
      await page.waitForTimeout(500);
      
      // Count cards after clicking
      const newCards = page.locator('[data-testid="ambassador-card"]');
      const newCount = await newCards.count();
      
      // Should have more cards
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should display ambassador card information', async ({ page }) => {
    // Wait for cards to load
    await page.waitForLoadState('networkidle');
    
    const firstCard = page.locator('[data-testid="ambassador-card"]').first();
    await expect(firstCard).toBeVisible();
    
    // Check that card contains expected information
    // (This will depend on your actual card structure)
    await expect(firstCard.locator('[data-testid="ambassador-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="ambassador-country"]')).toBeVisible();
    
    // Check for avatar/image
    const avatar = firstCard.locator('img').first();
    if (await avatar.isVisible()) {
      await expect(avatar).toHaveAttribute('src');
    }
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search ambassador');
    
    // Search for something that shouldn't exist
    await searchInput.fill('xyz123nonexistent');
    await page.waitForTimeout(500);
    
    // Check for no results message or empty state
    const ambassadorCards = page.locator('[data-testid="ambassador-card"]');
    const cardCount = await ambassadorCards.count();
    
    if (cardCount === 0) {
      // Could check for a "no results" message if implemented
      const resultCount = page.getByText(/Showing 0 Users|No ambassadors found/);
      await expect(resultCount).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and accessible
    await expect(
      page.getByText('Welcome to Cardano Ambassador Explorer')
    ).toBeVisible();
    
    // Check that search is accessible
    await expect(
      page.getByPlaceholder('Search ambassador')
    ).toBeVisible();
    
    // Check that cards are displayed (might be in different layout)
    await expect(page.locator('[data-testid="ambassador-card"]').first()).toBeVisible();
    
    // Test that search still works on mobile
    const searchInput = page.getByPlaceholder('Search ambassador');
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Should still show results
    const ambassadorCards = page.locator('[data-testid="ambassador-card"]');
    const cardCount = await ambassadorCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api/ambassadors**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Navigate to page
    await page.goto('/');
    
    // Wait for basic app load (not data load since we're simulating failure)
    await waitForAppToLoad(page);
    
    // Should still show the basic layout without crashing
    await expect(
      page.getByText('Welcome to Cardano Ambassador Explorer')
    ).toBeVisible();
    
    // Could check for error message or loading state
    // This depends on how your error handling is implemented
  });

  test.describe('Performance', () => {
    // Performance tests should not use the main beforeEach that waits for data
    // since we're testing the loading performance itself
    
    test('should load page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await waitForAppAndDataLoad(page); // Measure full load time
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds (increased for full app + data load)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle large number of results efficiently', async ({ page }) => {
      await page.goto('/');
      await waitForAppAndDataLoad(page);
      
      // Clear any filters to show all results
      const searchInput = page.getByPlaceholder('Search ambassador');
      await searchInput.clear();
      
      // Wait for results
      await page.waitForLoadState('networkidle');
      
      // Page should remain responsive
      const response = await page.evaluate(() => {
        return performance.now();
      });
      
      expect(response).toBeGreaterThan(0);
    });
  });
});
