const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControl", function () {
  let accessControl;
  let owner;
  let viewer;
  const testCid = "QmTest1234567890";
  const oneDay = 86400; // 1 day in seconds

  beforeEach(async function () {
    // Deploy the contract before each test
    const AccessControlFactory = await ethers.getContractFactory("AccessControl");
    accessControl = await AccessControlFactory.deploy();
    await accessControl.waitForDeployment();

    // Get signers
    [owner, viewer] = await ethers.getSigners();
  });

  it("should create access grants correctly", async function () {
    // No password case
    const noPasswordHash = ethers.ZeroHash;
    
    const tx = await accessControl.createAccess(testCid, oneDay, noPasswordHash);
    const receipt = await tx.wait();
    
    // Find AccessCreated event from transaction logs
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AccessCreated");
    expect(event).to.not.be.undefined;
    
    const accessId = event.args[0]; // First parameter is accessId
    
    // Check that access grant exists and has correct values
    const details = await accessControl.getAccessGrantDetails(accessId);
    expect(details[0]).to.equal(owner.address); // owner
    expect(details[1]).to.equal(testCid); // IPFS CID
    expect(details[3]).to.equal(false); // hasPassword
  });

  it("should verify access without password", async function () {
    // Create access grant without password
    const noPasswordHash = ethers.ZeroHash;
    const tx = await accessControl.createAccess(testCid, oneDay, noPasswordHash);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AccessCreated");
    const accessId = event.args[0];
    
    // Verify access
    const retrievedCid = await accessControl.verifyAccess(accessId, "");
    expect(retrievedCid).to.equal(testCid);
  });

  it("should verify access with correct password", async function () {
    const password = "secretPassword123";
    const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
    
    // Create access grant with password
    const tx = await accessControl.createAccess(testCid, oneDay, passwordHash);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AccessCreated");
    const accessId = event.args[0];
    
    // Verify access with correct password
    const retrievedCid = await accessControl.verifyAccess(accessId, password);
    expect(retrievedCid).to.equal(testCid);
  });

  it("should fail when verifying with incorrect password", async function () {
    const password = "secretPassword123";
    const incorrectPassword = "wrongPassword";
    const passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
    
    // Create access grant with password
    const tx = await accessControl.createAccess(testCid, oneDay, passwordHash);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AccessCreated");
    const accessId = event.args[0];
    
    // Verify that attempting access with wrong password fails
    await expect(
      accessControl.verifyAccess(accessId, incorrectPassword)
    ).to.be.revertedWith("Invalid password");
  });

  it("should fail when access grant has expired", async function () {
    // Create access grant with very short expiry
    const shortTime = 3; // 3 seconds
    const noPasswordHash = ethers.ZeroHash;
    
    const tx = await accessControl.createAccess(testCid, shortTime, noPasswordHash);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AccessCreated");
    const accessId = event.args[0];
    
    // Advance blockchain time by more than the expiry duration
    await ethers.provider.send("evm_increaseTime", [shortTime + 1]);
    await ethers.provider.send("evm_mine");
    
    // Verify that attempting access fails due to expiration
    await expect(
      accessControl.verifyAccess(accessId, "")
    ).to.be.revertedWith("Access grant has expired");
  });
});
