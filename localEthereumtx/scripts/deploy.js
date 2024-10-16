const hre = require("hardhat");

async function main() {
  // Get the contract factory for "TestContract"
  const TestContract = await hre.ethers.getContractFactory("TestContract");

  // Deploy the contract
  const instance = await TestContract.deploy();

  // Wait until the contract is deployed
  await instance.deployed();

  // Log the address to which the contract was deployed
  console.log(`Deployed to: ${instance.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
