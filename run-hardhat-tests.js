#!/usr/bin/env node

/**
 * Script to run Hardhat tests separately from Jest
 * This avoids conflicts between the two test environments
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Running Hardhat tests...');

// Run npx hardhat test with the specific test file
const hardhat = spawn('npx', ['hardhat', 'test', 'test/AccessControl.test.js'], {
  stdio: 'inherit',
  shell: true
});

hardhat.on('close', (code) => {
  process.exit(code);
});
