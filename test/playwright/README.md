# Playwright Authentication Setup

This directory contains the setup for authenticated Playwright tests for the Radiant Flow Imaging Hub dashboard.

## How It Works

1. **Global Setup**: The `global-setup.js` file handles the authentication process:
   - Launches a browser
   - Navigates to the login page
   - Authenticates with demo credentials
   - Saves the authenticated state to `auth.json`

2. **Authenticated Tests**: Tests can use the saved authentication state by:
   - Using the `authenticated` project in the Playwright config
   - Or explicitly using `test.use({ storageState: './test/playwright/auth.json' })` in test files

## Running Tests

### Run All Tests (Including Authentication Setup)

```bash
npx playwright test
```

### Run Only Authenticated Tests

```bash
npx playwright test --project=authenticated
```

### Run a Specific Test File with Authentication

```bash
npx playwright test dashboard.test.js --project=authenticated
```

## Example Usage

```javascript
// In your test file
const { test, expect } = require('@playwright/test');

test.describe('Protected Feature Tests', () => {
  // Use the authenticated state for all tests in this block
  test.use({ storageState: './test/playwright/auth.json' });
  
  test('should access protected feature', async ({ page }) => {
    // Start directly on a protected page - no login needed
    await page.goto('/patient/protected-feature');
    
    // Test authenticated functionality
    // ...
  });
});
```

## Notes

- The authentication state is stored in `auth.json` which contains cookies and localStorage data
- The state will expire based on your application's session timeout settings
- To refresh the authentication state, run the setup script: `npx playwright test global-setup.js`
- Consider moving credentials to environment variables for production use
