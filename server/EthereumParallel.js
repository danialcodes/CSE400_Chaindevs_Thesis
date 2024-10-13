const { ethers } = require('ethers');
const pidusage = require('pidusage'); // Import pidusage for resource monitoring
const fs = require('fs');
require('dotenv').config();

// Log files for transactions and resource utilization
const logFile = 'Ethereum_logs_individual.txt';
const tpsAndLatencyLog = 'Eth_TPS&AvgLatency_log.txt';
const ethWalletResource = "EthWalletResourceUsage.txt";
const resourceUsageLog = 'Ethereum_Resource_Usage.txt';

// This function will be called from `server.js`
async function executeEthereum(network, contractAddress, contractAbi, functionName, params, numberOfTransactions) {
    // Initialize the Ethereum provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(network);
    const privateKeys = JSON.parse(process.env.EthereumPrivateKeys);
    const wallets = [];
    for (let i = 0; i < privateKeys.length; i++) {
        const wallet = new ethers.Wallet(privateKeys[i], provider);
        wallets.push(wallet);
    }

    async function sendTransactions() {
        async function executeTransaction(gasPriceMultiplier, index, wallet, nonce) {
            const contract = new ethers.Contract(contractAddress, contractAbi, wallet);
            try {
                // Capture resource usage before the transaction
                const beforeStats = await pidusage(process.pid);

                const baseGasPrice = await provider.getGasPrice();
                const gasPrice = baseGasPrice.mul(gasPriceMultiplier);

                // Estimate the gas required for this transaction
                const gasLimit = await contract.estimateGas[functionName](params.value, { gasPrice });
                const startTime = process.hrtime(); // Start high-resolution time
                // Include the estimated gasLimit along with the gasPrice
                const tx = await contract[functionName](params.value, { gasPrice, gasLimit, nonce });
                console.log(`Transaction ${index} sent with gasPrice ${gasPrice.toString()} and gasLimit ${gasLimit.toString()}:`, tx.hash);

                const receipt = await tx.wait();
                const endTime = process.hrtime(startTime); // End high-resolution time

                // Convert hrtime to seconds (endTime[0] gives seconds, endTime[1] gives nanoseconds)
                const latency = endTime[0] + endTime[1] / 1e9;
                console.log(`Transaction ${index} mined: ${receipt.transactionHash}, Latency: ${latency}s`);

                const gasUsed = receipt.gasUsed;
                const transactionCost = gasUsed.mul(gasPrice);
                const etherUsed = ethers.utils.formatEther(transactionCost);
                console.log(`Gas used: ${gasUsed.toString()}, Ether used: ${etherUsed} ETH`);

                // Capture resource usage after the transaction
                const afterStats = await pidusage(process.pid);

                // Calculate resource usage differences
                const cpuUsage = (afterStats.cpu - beforeStats.cpu).toFixed(2);
                const memoryUsage = ((afterStats.memory - beforeStats.memory) / 1024 / 1024).toFixed(2); // In MB

                console.log(`Transaction ${index} - CPU used: ${cpuUsage}%, Memory used: ${memoryUsage} MB`);

                // Log to files
                fs.appendFileSync(logFile, `Transaction ${index} , Latency: ${latency}s\n`);
                fs.appendFileSync(ethWalletResource, `Transaction ${index}: GasPrice: ${gasPrice.toString()}, GasLimit: ${gasLimit.toString()}, Ether Used: ${etherUsed} ETH\n`);
                fs.appendFileSync(resourceUsageLog, `Transaction ${index} - CPU Used: ${cpuUsage}%, Memory Used: ${memoryUsage} MB\n`);

                return latency;
            } catch (error) {
                // Enhanced error handling for various scenarios
                if (error.code === 'INSUFFICIENT_FUNDS') {
                    console.error(`Error: Insufficient funds for transaction ${index}.`);
                } else if (error.code === 'NETWORK_ERROR') {
                    console.error(`Network error encountered during transaction ${index}.`);
                } else {
                    console.error(`Error executing transaction ${index}:`, error.message);
                }
                return null;
            }
        }

        function measureLatency(totalLatency, numOfTransactions) {
            const averageLatency = totalLatency / numOfTransactions;
            console.log(`Average Latency: ${averageLatency}s`);
            fs.appendFileSync(tpsAndLatencyLog, `Average Latency: ${averageLatency}s\n`);
        }

        const gasPriceMultipliers = [1];
        for (const multiplier of gasPriceMultipliers) {
            let walletCount = 0;
            const header = multiplier === 1 ? 'Default gas Price\n' : `${multiplier}x the default gas Price\n`;
            fs.appendFileSync(logFile, `${header}`);
            fs.appendFileSync(tpsAndLatencyLog, `${header}`);
            fs.appendFileSync(ethWalletResource, `${header}`);
            fs.appendFileSync(resourceUsageLog, `${header}`);

            const sendAndMeasure = async () => {
                const transactionPromises = [];
                let totalLatency = 0;
                const walletNonces = {};
                for (let i = 0; i < numberOfTransactions; i++) {
                    const wallet = wallets[walletCount];
                    if (!walletNonces[wallet.address]) {
                        walletNonces[wallet.address] = await provider.getTransactionCount(wallet.address, 'latest');
                    }

                    const currentNonce = walletNonces[wallet.address];
                    const transactionPromise = executeTransaction(multiplier, i + 1, wallet, currentNonce); // Pass transaction index
                    transactionPromises.push(transactionPromise);
                    walletNonces[wallet.address]++;

                    walletCount++;
                    if (walletCount === wallets.length) {
                        walletCount = 0;
                    }
                }

                

                const latencies = await Promise.all(transactionPromises);
                latencies.forEach(latency => {
                    if (latency !== null) {
                        totalLatency += latency;
                    }
                });
                const TimeTaken = Math.max(...latencies)
                const tps = numberOfTransactions / TimeTaken;
                console.log(`Actual TPS: ${tps}`);
                fs.appendFileSync(tpsAndLatencyLog, `TPS: ${tps} over ${TimeTaken}s\n`);

                if (totalLatency > 0) {
                    measureLatency(totalLatency, numberOfTransactions);
                }

               
            };

            await Promise.all([sendAndMeasure(), BlockGeneration()]);

            
        }

        async function BlockGeneration() {
            const startBlockNumber = await provider.getBlockNumber();
            await new Promise(resolve => setTimeout(resolve, 60 * 1000));

            const endBlockNumber = await provider.getBlockNumber();
            const BlockRate = (endBlockNumber - startBlockNumber) / 60
            const timestamp = new Date().toISOString();
            fs.appendFileSync(tpsAndLatencyLog, `Blocks Produced: ${endBlockNumber - startBlockNumber}, Block Production Rate: ${BlockRate}/sec at ${timestamp}\n`);
        }
    }

    await sendTransactions(); // Send transactions

   
}

module.exports = executeEthereum;
