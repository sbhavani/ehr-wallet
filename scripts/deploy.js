// Scripts for deploying the AccessControl contract
const hre = require("hardhat");

async function main() {
  console.log("Deploying AccessControl contract...");

  // Get the contract factory
  const AccessControlFactory = await hre.ethers.getContractFactory("AccessControl");
  
  // Deploy the contract
  const accessControl = await AccessControlFactory.deploy();
  
  // Wait for deployment to complete
  await accessControl.waitForDeployment();
  
  const address = await accessControl.getAddress();
  console.log(`AccessControl contract deployed to: ${address}`);

  // Log the info for verification (for public networks)
  console.log(`To verify on Etherscan (if on a public network):
  npx hardhat verify --network <network-name> ${address}`);

  return address;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
