const { chromium } = require('playwright');

async function loginAndScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Create a demo user session in localStorage
  const demoUser = {
    user: {
      id: 'demo-patient-1',
      name: 'Demo Patient',
      email: 'patient@example.com',
      role: 'PATIENT'
    }
  };

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/login');

  // Set localStorage before going to dashboard
  await page.evaluate((user) => {
    localStorage.setItem('patientSession', JSON.stringify(user));
  }, demoUser);

  console.log('Taking screenshot of main dashboard...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/public/healthwallet-dashboard.png' });

  console.log('Taking screenshot of access-logs...');
  await page.goto('http://localhost:3000/patient/access-logs');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/07-access-logs.png' });

  console.log('Taking screenshot of shared data...');
  await page.goto('http://localhost:3000/?tab=shared-data');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/02-dashboard-shared-data.png' });

  console.log('Taking screenshot of wallet...');
  await page.goto('http://localhost:3000/patient/wallet');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/05-wallet.png' });

  console.log('Taking screenshot of share-data...');
  await page.goto('http://localhost:3000/patient/share-data');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/06-share-data.png' });

  console.log('Taking screenshot of appointments...');
  await page.goto('http://localhost:3000/?tab=appointments');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/04-dashboard-appointments.png' });

  console.log('Taking screenshot of health data...');
  await page.goto('http://localhost:3000/?tab=health-data');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/sb/code/ehr-wallet/docs/03-dashboard-health.png' });

  await browser.close();
  console.log('Done!');
}

loginAndScreenshot().catch(console.error);
