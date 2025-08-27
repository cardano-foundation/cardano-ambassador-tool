import { Page, expect } from '@playwright/test';

/**
 * Waits for the app to fully load by ensuring the loading screen disappears
 * and essential elements are ready for interaction
 */
export async function waitForAppToLoad(page: Page, timeout: number = 50000) {
  console.log('[Test] Waiting for app to load...');
  
  try {
    // First, check if the loading screen is present
    const loadingScreen = page.locator('[data-testid="app-loading-screen"]');
    const isLoadingScreenPresent = await loadingScreen.isVisible();
    
    if (isLoadingScreenPresent) {
      console.log('[Test] Loading screen detected, waiting for it to disappear...');
      // Wait for the loading screen to disappear
      await loadingScreen.waitFor({ 
        state: 'hidden', 
        timeout 
      });
      console.log('[Test] Loading screen disappeared');
    } else {
      console.log('[Test] Loading screen not present, proceeding...');
    }
  } catch (error) {
    console.warn('[Test] Loading screen handling failed, proceeding anyway:', error);
  }

  // Wait for network to be idle (all async operations completed)
  await page.waitForLoadState('networkidle', { timeout });
  console.log('[Test] Network idle');

  // Ensure main content is visible
  await expect(page.getByText('Welcome to Cardano Ambassador Explorer')).toBeVisible({ timeout: 10000 });
  console.log('[Test] Main content visible');
  
  // Verify that essential interactive elements are present
  await expect(page.getByPlaceholder('Search ambassador')).toBeVisible({ timeout: 10000 });
  console.log('[Test] Search input visible');
  
  console.log('[Test] App fully loaded');
}

/**
 * Enhanced version that also waits for the first ambassador card to load
 */
export async function waitForAppAndDataLoad(page: Page, timeout: number = 50000) {
  // First wait for the app to load
  await waitForAppToLoad(page, timeout);
  
  console.log('[Test] Waiting for ambassador cards to load...');
  // Then wait for the first ambassador card to be visible (indicating data is loaded)
  await expect(page.locator('[data-testid="ambassador-card"]').first()).toBeVisible({ timeout });
  console.log('[Test] Ambassador cards loaded');
}

/**
 * Quick load check - useful for tests that don't need to verify data loading
 */
export async function waitForBasicAppLoad(page: Page, timeout: number = 10000) {
  // Just wait for loading screen to disappear and main heading to appear
  await page.locator('[data-testid="app-loading-screen"]').waitFor({ 
    state: 'hidden', 
    timeout 
  });
  
  await expect(page.getByText('Welcome to Cardano Ambassador Explorer')).toBeVisible();
}

/**
 * Utility to check if the app is currently loading
 */
export async function isAppLoading(page: Page): Promise<boolean> {
  try {
    const loadingScreen = page.locator('[data-testid="app-loading-screen"]');
    return await loadingScreen.isVisible();
  } catch {
    return false;
  }
}
