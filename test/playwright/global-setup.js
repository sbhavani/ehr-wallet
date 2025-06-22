// @ts-check
const { chromium } = require('@playwright/test');

// Login credentials - consider moving these to environment variables for production
const DEMO_EMAIL = 'patient@example.com';
const DEMO_PASSWORD = 'password';

/**
 * Global setup function to handle authentication and save the state
 * @see https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
 */
async function globalSetup() {
  // Launch a browser instance
  const browser = await chromium.launch();
  
  // Create a new context
  const context = await browser.newContext();
  
  // Create a new page in the context
  const page = await context.newPage();
  
  // Navigate to login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/login');
  
  // Find and click on the Email & Password Login button
  console.log('Clicking Email & Password Login button...');
  const emailPasswordButton = page.getByRole('button', { name: /Email & Password Login/i });
  await emailPasswordButton.click();
  
  // Wait for the form to appear and fill in credentials
  console.log('Entering credentials...');
  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  
  // Click the login button and wait for navigation
  console.log('Submitting login form...');
  // Make sure the button is visible and stable before clicking
  const loginButton = page.getByRole('button', { name: 'Login', exact: true });
  await loginButton.waitFor({ state: 'visible', timeout: 15000 });
  // Force click can help with elements that might be detached during rendering
  await loginButton.click({ force: true, timeout: 15000 });
  
  // Wait for navigation to complete (with a longer timeout)
  console.log('Waiting for navigation to dashboard...');
  await page.waitForURL('**/patient/dashboard', { timeout: 30000 });
  
  // Verify we're logged in
  console.log('Verifying login was successful...');
  const url = page.url();
  if (!url.includes('/patient/dashboard')) {
    throw new Error(`Login failed. Current URL: ${url}`);
  }
  
  // Save the authentication state to the 'auth.json' file
  console.log('Saving authentication state...');
  await context.storageState({ path: './test/playwright/auth.json' });
  
  // Close the browser
  await browser.close();
  
  console.log('Authentication state has been saved successfully!');
}

module.exports = globalSetup;
