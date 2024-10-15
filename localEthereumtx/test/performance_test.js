const { ethers } = require("ethers");
const pidusage = require('pidusage'); // Import pidusage for resource monitoring
const fs = require('fs');

// Log files for transactions and resource utilization
const logFile = 'Hardhat_logs_individual.txt';
const tpsAndLatencyLog = 'Hardhat_TPS&AvgLatency_log.txt';
const hardhatResourceUsageLog = 'Hardhat_Resource_Usage.txt';
const walletResourceLog = 'wallet_resource_usage.txt';

// ABI and Contract Address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
const abi = require("../ABI.json"); // Replace with your ABI file



// Main execution function
async function main() {
  // Connect to the local hardhat node
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

  // Function to derive private keys from Hardhat's default mnemonic
  async function getAccountsFromMnemonic(mnemonic,walletNeeded) {
    const accounts = [];

    for (let i = 0; i < 20; i++) { // Hardhat provides 20 default accounts
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
      accounts.push(wallet);
    }

    return accounts;
  } 
  
  // Function to interact with your contract
  async function performTransaction(index, functionName ,value, walletCount,signerInstances) {
    const contract = new ethers.Contract(contractAddress, abi, signerInstances[walletCount].connect(provider)); // Connect signer to provider
    try {
      // Capture resource usage before the transaction
      const beforeStats = await pidusage(process.pid);

      const startTime = process.hrtime(); // Start high-resolution time

      const feeData = await provider.getFeeData(); // Use getFeeData() instead of getGasPrice()
      const gasPrice = feeData.gasPrice; // Extract the gasPrice from feeData

      const gasLimit = await contract.estimateGas[functionName](value, { gasPrice }); // Estimate gas for the transaction

      const tx = await contract[functionName](value, { gasPrice, gasLimit }); // Contract function call
      const receipt = await tx.wait(); // Wait for the transaction to be mined
      console.log(`Transaction ${index} mined: ${tx.hash}`);

      const endTime = process.hrtime(startTime); // End high-resolution time
      const latency = endTime[0] + endTime[1] / 1e9; // Convert to seconds
      console.log(`Transaction ${index} Latency: ${latency}s`);

      const gasUsed = receipt.gasUsed; // Get the gas used for the transaction
      const transactionCost = gasUsed.mul(gasPrice); // Calculate the total cost in wei
      const etherUsed = ethers.utils.formatEther(transactionCost); // Convert to Ether
      console.log(`Gas used: ${gasUsed.toString()}, Ether used: ${etherUsed} ETH`);

      // Log GasPrice, GasLimit, and Ether Used in the wallet_resource_usage.txt file
      fs.appendFileSync(walletResourceLog, `Transaction ${index}: GasPrice: ${gasPrice.toString()}, GasLimit: ${gasLimit.toString()}, Ether Used: ${etherUsed} ETH\n`);

      // Capture resource usage after the transaction
      const afterStats = await pidusage(process.pid);

      // Calculate resource usage differences
      const cpuUsage = (afterStats.cpu - beforeStats.cpu).toFixed(2);
      const memoryUsage = ((afterStats.memory - beforeStats.memory) / 1024 / 1024).toFixed(2); // In MB

      console.log(`Transaction ${index} - CPU used: ${cpuUsage}%, Memory used: ${memoryUsage} MB`);

      // Log to files
      fs.appendFileSync(logFile, `Transaction ${index}, Latency: ${latency}s\n`);
      fs.appendFileSync(hardhatResourceUsageLog, `Transaction ${index} (Wallet ${walletCount + 1}) - CPU Used: ${cpuUsage}%, Memory Used: ${memoryUsage} MB\n`);

      return latency;
    } catch (error) {
      console.error(`Transaction ${index} Error: ${error.message}`);
      return null;
    }
  }

  // Function to measure TPS and Latency together
  async function measureTpsAndLatency(numTransactions,functionName,value) {
    // Get the accounts programmatically from Hardhat's default mnemonic
    const defaultMnemonic = "test test test test test test test test test test test junk"; // Hardhat default mnemonic
    const signerInstances = await getAccountsFromMnemonic(defaultMnemonic,numTransactions);
    let totalLatency = 0;
    const transactionLatencies = [];

    function measureLatency(totalLatency, numOfTransactions) {
      const averageLatency = totalLatency / numOfTransactions;
      console.log(`Average Latency: ${averageLatency}s`);
      fs.appendFileSync(tpsAndLatencyLog, `Average Latency: ${averageLatency}s\n`);
    }

    let walletCount = 0;
    for (let i = 0; i < numTransactions; i++) {
      const latency = performTransaction(i + 1,functionName, value, walletCount,signerInstances); // Send the transaction and measure latency
      transactionLatencies.push(latency);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between transactions

      walletCount++;
      if (walletCount === 20) {
        walletCount = 0;
      }
    }

    const latencies = await Promise.all(transactionLatencies);
    latencies.forEach(latency => {
      if (latency !== null) {
        totalLatency += latency;
      }
    });

    const TimeTaken = Math.max(...latencies);
    const tps = numTransactions / TimeTaken;
    console.log(`Actual TPS: ${tps}`);
    fs.appendFileSync(tpsAndLatencyLog, `TPS: ${tps} over ${TimeTaken}s\n`);

    if (totalLatency > 0) {
      measureLatency(totalLatency, numTransactions);
    }
  }

  
  
  const functionName = "setval"
  // const functionName = "computeAndStoreFibonacci"
  // const functionName = "storeData"
  
  
  
  
  
  const parameter = 50 //for setval function
  // const parameter = 15 //for fibonacci function
  // const parameter = [1,2,3,4,5,6,7,8,9,10] //for storedata function
  
  
  
  
  const numTransactions = 80; //This is load
  await measureTpsAndLatency(numTransactions,functionName,parameter);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
