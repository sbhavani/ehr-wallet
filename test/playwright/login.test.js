const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_URL = 'http://localhost:3000/login';
const DEMO_EMAIL = 'patient@example.com';
const DEMO_PASSWORD = 'password';

test.describe('Login Test', () => {
  test('should login with demo credentials', async ({ page }) => {
    // Navigate to login page
    console.log(`Navigating to ${TEST_URL}...`);
    await page.goto(TEST_URL);
    
    // Wait for the page to load
    // Check for the login card title instead of page title
    await expect(page.locator('h2.text-lg.font-semibold')).toHaveText(/Patient Login/);
    
    // Find and click on the Email & Password Login button
    console.log('Clicking Email & Password Login button...');
    const emailPasswordButton = page.getByRole('button', { name: /Email & Password Login/i });
    await emailPasswordButton.click();
    
    // Wait for the form to appear and fill in credentials
    console.log('Entering demo credentials...');
    await page.getByLabel('Email').fill(DEMO_EMAIL);
    await page.getByLabel('Password').fill(DEMO_PASSWORD);
    
    // Click the login button and wait for navigation
    console.log('Submitting login form...');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    
    // Wait for navigation to complete (with a longer timeout)
    console.log('Waiting for navigation to dashboard...');
    await page.waitForURL('**/patient/dashboard', { timeout: 30000 });
    
    // Verify we're on the dashboard page by checking URL
    console.log('Verifying dashboard URL...');
    expect(page.url()).toContain('/patient/dashboard');
    
    // Take a screenshot of whatever is on the dashboard page
    console.log('Taking screenshot of current page state...');
    await page.screenshot({ path: './test-results/login-successful.png' });
    
    console.log('Login test completed successfully!');
  });
});
