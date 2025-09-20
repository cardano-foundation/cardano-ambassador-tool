# Testing Guide for Cardano Ambassador Tool

This document provides comprehensive information about the testing setup and strategies implemented in the Cardano Ambassador Tool.

## 🧪 Testing Stack

### Unit & Integration Testing

- **Jest** - JavaScript testing framework
- **React Testing Library** - Testing utilities for React components
- **@testing-library/jest-dom** - Custom Jest matchers for DOM nodes
- **@testing-library/user-event** - Fire events the same way the user does

### End-to-End Testing

- **Playwright** - Cross-browser automation framework
- **Visual Regression Testing** - Screenshot comparisons for UI consistency

## 🏗️ Project Structure

```
client/
├── __tests__/
│   ├── components/           # Component unit tests
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── Input.test.tsx
│   │   └── AmbassadorSearchBar.test.tsx
│   ├── hooks/               # Hook unit tests
│   │   ├── useDatabase.test.ts
│   │   └── useUserAuth.test.ts
│   ├── fixtures/            # Mock data and test utilities
│   │   ├── mockAmbassadors.ts
│   │   └── mockUtxos.ts
│   └── utils/               # Test utilities
│       └── testUtils.tsx
├── e2e/                     # Playwright E2E tests
│   ├── ambassador-browsing.spec.ts
│   └── visual-regression.spec.ts
├── jest.config.js           # Jest configuration
├── jest.setup.js           # Test environment setup
└── playwright.config.ts    # Playwright configuration
```

## 🚀 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (visual test runner)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## 🎯 Testing Strategy

### 1. Unit Testing

#### Component Testing

- **Render Testing**: Verify components render without crashing
- **Props Testing**: Ensure props are handled correctly
- **User Interaction**: Test click events, form inputs, keyboard navigation
- **Conditional Rendering**: Test different states and variants
- **Accessibility**: Verify ARIA attributes and semantic HTML

Example:

```typescript
it('handles click events', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Clickable</Button>);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### Hook Testing

- **State Management**: Test state updates and side effects
- **API Integration**: Mock external dependencies
- **Error Handling**: Test error scenarios and recovery
- **Cleanup**: Verify proper resource cleanup

Example:

```typescript
it('should initialize with loading state', () => {
  const { result } = renderHook(() => useDatabase());

  expect(result.current.loading).toBe(true);
  expect(result.current.intents).toEqual([]);
});
```

### 2. Integration Testing

- **Component Integration**: Test components working together
- **Data Flow**: Verify data passing between components
- **User Workflows**: Test complete user interactions
- **Context Providers**: Test context consumption and updates

### 3. End-to-End Testing

- **Critical User Paths**: Ambassador browsing, search, filtering
- **Cross-browser Compatibility**: Chrome, Firefox, Safari, Edge
- **Responsive Design**: Mobile, tablet, desktop viewports
- **Performance**: Page load times and responsiveness
- **Error States**: Network failures, API errors
- **Loading States**: Proper handling of app initialization

### 4. Visual Regression Testing

- **UI Consistency**: Catch unintended visual changes
- **Component States**: Test hover, focus, disabled states
- **Responsive Layouts**: Different screen sizes
- **Dark/Light Modes**: Theme consistency

## 🔧 Configuration

### Jest Setup

The Jest configuration is optimized for Next.js with the following features:

- TypeScript support
- Module path mapping for `@/` imports
- jsdom test environment for DOM testing
- Coverage reporting with thresholds
- Ignore patterns for build artifacts

### Playwright Setup

Playwright is configured for:

- Multiple browser engines (Chromium, Firefox, WebKit)
- Various device viewports
- Automatic server startup for testing
- Screenshot and video capture on failures
- Trace collection for debugging

## 📊 Test Coverage

Current coverage targets:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

Generate coverage report:

```bash
npm run test:coverage
```

View coverage report at `coverage/lcov-report/index.html`

## 🔍 Debugging Tests

### Unit Tests

```bash
# Run tests in debug mode
npm test -- --detectOpenHandles

# Run specific test with verbose output
npm test -- Button.test.tsx --verbose
```

### E2E Tests

```bash
# Debug with Playwright Inspector
npm run test:e2e:debug

# Run tests with browser visible
npm run test:e2e:headed

# Generate test report
npm run test:e2e && npx playwright show-report
```

## 🎨 Visual Testing

Playwright automatically captures screenshots for:

- Failed tests
- Visual regression comparisons
- Different browser/viewport combinations

Screenshots are stored in `test-results/` directory.

## ⏳ Handling Loading States in E2E Tests

### The Challenge

The app has an initialization loading screen that appears on every page load. This loading screen waits for:

- Database initialization (`useDatabase` hook)
- Theme initialization (`useThemeManager` hook)
- Network validation
- A small delay for smooth UX (800ms in production, 100ms in test environment)

Without proper handling, E2E tests will timeout waiting for elements hidden behind the loading screen.

### The Solution

#### 1. Test Data Attributes

The loading screen has `data-testid="app-loading-screen"` for easy detection:

```typescript
// Check if app is currently loading
const isLoading = await page
  .locator('[data-testid="app-loading-screen"]')
  .isVisible();
```

#### 2. Environment Optimization

Loading delays are automatically reduced in test environments:

- Production: 800ms delay
- Test environment: 100ms delay
- Playwright sets `PLAYWRIGHT=true` environment variable automatically

#### 3. Loading Utilities

Use utilities from `e2e/utils/waitForAppLoad.ts`:

##### `waitForAppAndDataLoad(page, timeout = 15000)`

**Most common usage** - Waits for full app initialization AND data loading:

```typescript
import { waitForAppAndDataLoad } from './utils/waitForAppLoad';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await waitForAppAndDataLoad(page);
});
```

##### `waitForAppToLoad(page, timeout = 15000)`

Waits for app initialization but not data - good for error scenarios:

```typescript
test('should handle network failures', async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ status: 500 }));
  await page.goto('/');
  await waitForAppToLoad(page); // Don't wait for data that will fail
});
```

##### `waitForBasicAppLoad(page, timeout = 10000)`

Quick load check - just waits for loading screen and main heading:

```typescript
// For simple smoke tests
await waitForBasicAppLoad(page);
```

##### `isAppLoading(page)`

Utility to check current loading state:

```typescript
if (await isAppLoading(page)) {
  console.log('App is still loading...');
}
```

### Usage Guidelines

#### Standard Test Pattern

```typescript
import { waitForAppAndDataLoad } from './utils/waitForAppLoad';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to fully load before any tests
    await waitForAppAndDataLoad(page);
  });

  test('should test functionality', async ({ page }) => {
    // App is already loaded - can immediately test
    await expect(page.getByText('Welcome')).toBeVisible();
  });
});
```

#### Error Scenario Tests

```typescript
test('should handle API failures', async ({ page }) => {
  // Setup API intercept first
  await page.route('**/api/ambassadors**', (route) => {
    route.fulfill({ status: 500 });
  });

  await page.goto('/');
  // Don't wait for data since API will fail
  await waitForAppToLoad(page);

  // Test error handling
  await expect(page.getByText('Error loading')).toBeVisible();
});
```

#### Performance Tests

```typescript
test('should load within reasonable time', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await waitForAppAndDataLoad(page); // Measure complete load

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(10000); // 10 seconds max
});
```

### Troubleshooting Loading Issues

#### Tests Still Timing Out?

1. **Check loading screen detection:**

   ```typescript
   console.log('Is loading:', await isAppLoading(page));
   ```

2. **Increase timeout for slow environments:**

   ```typescript
   await waitForAppAndDataLoad(page, 30000); // 30 seconds
   ```

3. **Use more specific waiting:**
   ```typescript
   // Instead of general loading, wait for specific elements
   await expect(page.getByTestId('specific-content')).toBeVisible();
   ```

#### Loading Screen Not Found?

- Verify `data-testid="app-loading-screen"` exists in AppLoadingScreen component
- Check if loading screen appears at all (might be too fast)
- Use browser dev tools to inspect the loading state

#### Database/Network Issues?

- Check database initialization hooks
- Verify API endpoints are responding
- Use `waitForAppToLoad` instead of `waitForAppAndDataLoad` for data issues

### Best Practices

1. **Always handle loading** - Use appropriate loading utility in every test
2. **Choose right utility** - Don't over-wait but ensure proper initialization
3. **Test loading states** - Include tests for loading experience itself
4. **Handle errors gracefully** - Use `waitForAppToLoad` for error scenarios
5. **Monitor performance** - Track loading times to catch regressions

### Loading State Test Examples

#### Testing Loading Screen Itself

```typescript
test('should show loading screen on initial load', async ({ page }) => {
  // Don't wait for loading to complete
  const navigationPromise = page.goto('/');

  // Check loading screen appears
  await expect(
    page.locator('[data-testid="app-loading-screen"]'),
  ).toBeVisible();

  // Wait for navigation to complete
  await navigationPromise;
  await waitForAppAndDataLoad(page);

  // Loading screen should be gone
  await expect(page.locator('[data-testid="app-loading-screen"]')).toBeHidden();
});
```

#### Testing Progressive Loading

```typescript
test('should load content progressively', async ({ page }) => {
  await page.goto('/');

  // Basic app should load first
  await waitForAppToLoad(page);
  await expect(page.getByText('Welcome')).toBeVisible();

  // Then data should load
  await expect(
    page.locator('[data-testid="ambassador-card"]').first(),
  ).toBeVisible();
});
```

Screenshots are stored in `test-results/` directory.

## 📝 Writing Tests

### Best Practices

#### 1. Test Structure

```typescript
describe('Component/Feature', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should describe what it tests', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

#### 2. Naming Conventions

- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Use `it` for individual test cases

#### 3. Mock Strategy

```typescript
// Mock external dependencies at module level
jest.mock('@/lib/api', () => ({
  fetchAmbassadors: jest.fn(),
}));

// Use MSW for API mocking in integration tests
// Use fixtures for consistent test data
```

#### 4. Async Testing

```typescript
it('should handle async operations', async () => {
  render(<AsyncComponent />);

  // Wait for element to appear
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Common Patterns

#### Testing Props and Variants

```typescript
const variants = ['primary', 'secondary', 'outline'];
variants.forEach(variant => {
  it(`should render ${variant} variant correctly`, () => {
    render(<Button variant={variant}>Test</Button>);
    // Assertions for variant-specific classes
  });
});
```

#### Testing User Interactions

```typescript
it('should handle user input', async () => {
  const user = userEvent.setup();
  render(<SearchInput onSearch={mockHandler} />);

  const input = screen.getByRole('textbox');
  await user.type(input, 'search query');

  expect(mockHandler).toHaveBeenCalledWith('search query');
});
```

## 🔄 Continuous Integration

The testing pipeline includes:

1. **Linting**: ESLint and TypeScript checks
2. **Unit Tests**: Jest with coverage reporting
3. **E2E Tests**: Playwright across multiple browsers
4. **Visual Regression**: Screenshot comparisons
5. **Performance**: Lighthouse audits (if configured)

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure coverage thresholds are met
3. Add E2E tests for new user workflows
4. Update visual regression tests for UI changes
5. Document complex test scenarios

For questions about testing, check existing test files for patterns or create an issue for discussion.
