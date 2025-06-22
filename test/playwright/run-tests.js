const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, '..', '..', 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

console.log('🚀 Running Playwright tests...');

try {
  // Run the Playwright test using the configuration
  execSync('npx playwright test', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..', '..')
  });
  
  console.log('✅ Tests completed successfully!');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
