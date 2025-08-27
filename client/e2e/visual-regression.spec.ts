import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport for screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any loading states to complete
    await page.waitForTimeout(1000);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2, // Allow 20% pixel difference
    });
  });

  test('homepage hero section snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Screenshot just the hero section
    const heroSection = page.locator('.space-y-4').first();
    await expect(heroSection).toHaveScreenshot('homepage-hero.png');
  });

  test('search bar component snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and screenshot the search bar
    const searchBar = page.locator('.flex.flex-col.sm\\:flex-row.gap-3.sm\\:gap-4').first();
    await expect(searchBar).toHaveScreenshot('search-bar.png');
  });

  test('ambassador grid view snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="ambassador-card"]');
    
    // Screenshot the grid container
    const gridContainer = page.locator('.grid').first();
    await expect(gridContainer).toHaveScreenshot('ambassador-grid.png');
  });

  test('ambassador card snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for cards to load and screenshot the first one
    const firstCard = page.locator('[data-testid="ambassador-card"]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveScreenshot('ambassador-card.png');
  });

  test('dropdown menu open state snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open the region dropdown
    const regionButton = page.getByText('Region').first();
    await regionButton.click();
    
    // Wait for dropdown to open
    await page.waitForSelector('text=All Regions');
    
    // Screenshot the dropdown area
    const dropdown = page.locator('.absolute.left-0.right-0').first();
    await expect(dropdown).toHaveScreenshot('region-dropdown-open.png');
  });

  test('list view snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Switch to list view
    const listViewButton = page.getByTitle('List view');
    await listViewButton.click();
    await page.waitForTimeout(500);
    
    // Screenshot the list container
    const listContainer = page.locator('.space-y-3, .space-y-4').first();
    await expect(listContainer).toHaveScreenshot('ambassador-list.png');
  });

  test('mobile homepage snapshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take full page screenshot on mobile
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
    });
  });

  test('tablet homepage snapshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take full page screenshot on tablet
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
    });
  });

  test('search results snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform a search
    const searchInput = page.getByPlaceholder('Search ambassador');
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Screenshot search results
    const resultsContainer = page.locator('.grid, .space-y-3').first();
    await expect(resultsContainer).toHaveScreenshot('search-results.png');
  });

  test('empty search results snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform a search that should return no results
    const searchInput = page.getByPlaceholder('Search ambassador');
    await searchInput.fill('xyz123nonexistent');
    await page.waitForTimeout(1000);
    
    // Screenshot empty state
    const mainContent = page.locator('main, .container').first();
    await expect(mainContent).toHaveScreenshot('empty-search-results.png');
  });

  test('dark mode snapshot', async ({ page }) => {
    // Enable dark mode (this depends on how your dark mode is implemented)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add dark mode class to html element (adjust based on your implementation)
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(500);
    
    // Take screenshot in dark mode
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
    });
  });

  test('hover states snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hover over the first ambassador card
    const firstCard = page.locator('[data-testid="ambassador-card"]').first();
    await firstCard.hover();
    
    await expect(firstCard).toHaveScreenshot('ambassador-card-hover.png');
  });

  test('focus states snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Focus on search input
    const searchInput = page.getByPlaceholder('Search ambassador');
    await searchInput.focus();
    
    // Screenshot focused search bar
    const searchContainer = searchInput.locator('..');
    await expect(searchContainer).toHaveScreenshot('search-input-focused.png');
  });

  test('loading state snapshot', async ({ page }) => {
    // Intercept API calls to delay them
    await page.route('**/api/**', async route => {
      // Delay the response
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/');
    
    // Take screenshot during loading (if loading state is implemented)
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('loading-state.png');
  });

  test('error state snapshot', async ({ page }) => {
    // Make API calls fail
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' })
      });
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Screenshot error state (if implemented)
    await expect(page).toHaveScreenshot('error-state.png');
  });

  test.describe('Cross-browser visual consistency', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 414, height: 896, name: 'mobile-large' },
      { width: 375, height: 667, name: 'mobile-medium' },
    ];

    viewports.forEach(({ width, height, name }) => {
      test(`homepage at ${name} resolution`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await expect(page).toHaveScreenshot(`homepage-${name}.png`, {
          fullPage: true,
          threshold: 0.1,
        });
      });
    });
  });

  test.describe('Component isolation tests', () => {
    // These tests would be useful if you have a component library or Storybook

    test('button variants snapshot', async ({ page }) => {
      // This would require a dedicated page with all button variants
      // For now, we'll test buttons as they appear in the main app
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find view toggle buttons
      const viewToggle = page.locator('.px-\\[2px\\].py-1.bg-neutral-50').first();
      await expect(viewToggle).toHaveScreenshot('button-variants.png');
    });

    test('input field states snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.getByPlaceholder('Search ambassador');
      await expect(searchInput).toHaveScreenshot('input-default.png');

      // Focus state
      await searchInput.focus();
      await expect(searchInput).toHaveScreenshot('input-focused.png');

      // With content
      await searchInput.fill('Sample text');
      await expect(searchInput).toHaveScreenshot('input-with-content.png');
    });
  });
});
