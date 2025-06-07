const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the types directory exists
const typesDir = path.join(__dirname, '../types/contracts');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

console.log('Generating TypeScript types for contracts...');

// Run hardhat typechain to generate TypeScript types
try {
  execSync('npx hardhat typechain', { stdio: 'inherit' });
  console.log('Contract types successfully generated.');
  
  // Copy the generated types to a location that the Next.js app can use
  const contractArtifactsDir = path.join(__dirname, '../artifacts/contracts');
  const contractTypesDir = path.join(__dirname, '../types/contracts');
  
  console.log('Copying contract ABI to app directory...');
  
  // Read AccessControl.sol artifacts
  const artifactPath = path.join(contractArtifactsDir, 'AccessControl.sol/AccessControl.json');
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Extract and save the ABI
    const abiPath = path.join(__dirname, '../app/lib/contracts/AccessControlAbi.json');
    
    // Ensure directory exists
    const abiDir = path.dirname(abiPath);
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    // Write the ABI to a file
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`ABI saved to ${abiPath}`);
  } else {
    console.log('AccessControl artifacts not found. Make sure to run "npx hardhat compile" first.');
  }
} catch (error) {
  console.error('Error generating contract types:', error);
  process.exit(1);
}
