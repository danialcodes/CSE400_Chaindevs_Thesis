const TronWeb = require('tronweb');
const pidusage = require('pidusage');
const fs = require('fs');
require('dotenv').config();

// Log files for transactions and resource utilization
const logFile = 'Tron_logs_individual.txt';
const tpsAndLatencyLog = 'Tron_TPS&AvgLatency_log.txt';
const tronWalletResource = 'TronWalletResourceUsage.txt';
const resourceUsageLog = 'Tron_Resource_Usage.txt'; 

// This function will be called from `server.js`
async function executeTron(network, contractAddress, abi, functionName, params, numberOfTransactions) {
    // Initialize TronWeb instances for both wallets
    const privateKeys = JSON.parse(process.env.TronprivateKeys);
    const txIds = []
    const tronWeb = new TronWeb({
        fullHost: network,
        privateKey: privateKeys[0]
    });

    const wallets = []

    for (let i = 0; i < privateKeys.length; i++) {
        const wallet = new TronWeb({
            fullHost: network,
            privateKey: privateKeys[i]
        });

        wallets.push(wallet)
    }

    // Fetch transaction info using the transaction hash
 

    async function sendTransactions() {

        async function fetchTransactionInfo(tronWeb, transactionID) {
            try {
                const transaction = await tronWeb.trx.getTransactionInfo(transactionID);
                const energyUsed = transaction.receipt.energy_usage_total || 0;
                const trxUsed = (transaction.fee || 0) / 1e6; // Convert from sun to TRX
                const bandwidthUsed = (transaction.receipt.net_fee || 0) / 1e3;
                return { energyUsed, bandwidthUsed, trxUsed };
            } catch (error) {
                console.error('Error fetching transaction info:', error);
                return { energyUsed: 0, trxUsed: 0 };
            }
        }

        async function executeTransaction(contract, functionName, params, index) {
            try {
                const beforeStats = await pidusage(process.pid); // Capture CPU/Memory before transaction

                const startTime = Date.now();
                const tx = await contract.methods[functionName](params.value).send(); // Dynamic function call
                console.log(`Transaction ${index} sent`, tx);

                const endTime = Date.now();
                const latency = (endTime - startTime) / 1000;
                console.log(`Transaction ${index}, Latency: ${latency}s`);

                const afterStats = await pidusage(process.pid); // Capture CPU/Memory after transaction
                const cpuUsage = (afterStats.cpu - beforeStats.cpu).toFixed(2);
                const memoryUsage = ((afterStats.memory - beforeStats.memory) / 1024 / 1024).toFixed(2); // Convert memory to MB
                // 
                txIds.push(tx)
                console.log(`CPU used: ${cpuUsage}%, Memory used: ${memoryUsage} MB for this transaction`);
                fs.appendFileSync(resourceUsageLog, `Transaction ${index} - CPU Used: ${cpuUsage}%, Memory Used: ${memoryUsage} MB\n`);
                fs.appendFileSync(logFile, `Transaction ${index}: Latency: ${latency}s\n`);
                // 

                return latency;
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        // Measure average latency
        function measureLatency(totalLatency, numOfTransactions) {
            const averageLatency = totalLatency / numOfTransactions;
            fs.appendFileSync(tpsAndLatencyLog, `Average Latency: ${averageLatency}s\n`);
        }

        

        const sendAndMeasure = async () => {
            const transactionPromises = [];
            let totalLatency = 0;
            let walletCount = 0
            const startTime = process.hrtime(); // Start time for TPS measurement
            for (let i = 0; i < numberOfTransactions; i++) {
                const contractInstance = wallets[walletCount].contract(abi, contractAddress);
                const transactionPromise = executeTransaction(contractInstance, functionName, params, i + 1);
                transactionPromises.push(transactionPromise);
                //await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second interval between transactions
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
            // End time for TPS measurement
            const endTime = process.hrtime(startTime);
            const actualTimeTaken = endTime[0] + endTime[1] / 1e9; // Convert to seconds

            const tps = numberOfTransactions / actualTimeTaken;
            console.log(`Actual TPS: ${tps}`);
            fs.appendFileSync(tpsAndLatencyLog, `Actual TPS: ${tps} over ${actualTimeTaken}s\n`);

            if (totalLatency > 0) {
                measureLatency(totalLatency, numberOfTransactions);
            }
        };

        await Promise.all([sendAndMeasure(), BlockGeneration()]);

        async function BlockGeneration() {
            try {
                const startBlock = await tronWeb.trx.getCurrentBlock();
                const startBlockNum = startBlock.block_header.raw_data.number;

                await new Promise(resolve => setTimeout(resolve, 60 * 1000));

                const endBlock = await tronWeb.trx.getCurrentBlock();
                const endBlockNum = endBlock.block_header.raw_data.number;
                const BlockRate = (endBlockNum - startBlockNum) / 60
                const timestamp = new Date().toISOString();
                fs.appendFileSync(tpsAndLatencyLog, `Blocks Produced: ${endBlockNum - startBlockNum}, Block Production Rate: ${BlockRate}/sec at ${timestamp}\n`);
            } catch (error) {
                console.error(`Error measuring throughput for:`, error);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 20000));

        for (let i = 0; i < txIds.length; i++) {
            const transactionInfo = await fetchTransactionInfo(tronWeb, txIds[i]);
            fs.appendFileSync(tronWalletResource, `Trx Used : ${transactionInfo.trxUsed}: Energy Required: ${transactionInfo.energyUsed}: Bandwidth Required: ${transactionInfo.bandwidthUsed}\n`);
        }
    }

    await sendTransactions(); // Send transactions
}

// Export the function so it can be called from server.js
module.exports = executeTron;
