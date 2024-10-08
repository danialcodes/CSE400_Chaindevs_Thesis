const TronWeb = require('tronweb');
const pidusage = require('pidusage');
const fs = require('fs');
require('dotenv').config();
const measurementPeriod = 60; 
const logFile = 'Tron_logs_individual.txt';
const tpsAndLatencyLog = 'Tron_TPS&AvgLatency_log.txt';
const tronWalletResource = 'TronWalletResourceUsage.txt';
const resourceUsageLog = 'Tron_Resource_Usage.txt'; 

// Fetch transaction info using the transaction hash
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

async function executeTron(network, contractAddress, abi, functionName, params, numberOfTransactions) {
    // Initialize TronWeb instances for both wallets
    const privateKeys = JSON.parse(process.env.TronprivateKeys);
    const txIds = []
    const tronWeb = new TronWeb({
        fullHost: network,
        privateKey: privateKeys[0]
    });

    const wallets = []

    for(let i = 0;i<privateKeys.length;i++){
        const wallet = new TronWeb({
            fullHost: network,
            privateKey: privateKeys[i]
        });

        wallets.push(wallet)
    }
   
    let totalLatency = 0;
    async function sendTransaction(contract, functionName, params, index) {
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
        let walletCount = 0
        for (let i = 0; i < numberOfTransactions; i++) {
            const contractInstance = wallets[walletCount].contract(abi, contractAddress);
            const transactionPromise = sendTransaction(contractInstance, functionName, params, i + 1);
            transactionPromises.push(transactionPromise);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second interval between transactions
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
        if (totalLatency > 0) {
            measureLatency(totalLatency, numberOfTransactions);
        }
    };

    await Promise.all([sendAndMeasure(), measureThroughput()]);
    await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for 4 seconds

    for(let i=0;i<txIds.length;i++){
        const transactionInfo = await fetchTransactionInfo(tronWeb, txIds[i]);
        fs.appendFileSync(tronWalletResource, `Trx Used : ${transactionInfo.trxUsed}: Energy Required: ${transactionInfo.energyUsed}: Bandwidth Required: ${transactionInfo.bandwidthUsed}\n`);
    }

    // Measure throughput (TPS)
    async function measureThroughput() {
        try {
            const startBlock = await tronWeb.trx.getCurrentBlock();
            const startBlockNum = startBlock.block_header.raw_data.number;

            await new Promise(resolve => setTimeout(resolve, measurementPeriod * 1000));

            const endBlock = await tronWeb.trx.getCurrentBlock();
            const endBlockNum = endBlock.block_header.raw_data.number;

            let transactionCount = 0;

            for (let i = startBlockNum; i <= endBlockNum; i++) {
                const block = await tronWeb.trx.getBlock(i);

                if (block.transactions && block.transactions.length > 0) {
                    block.transactions.forEach(tx => {
                        if (tx.raw_data.contract[0].parameter.value.contract_address === tronWeb.address.toHex(contractAddress)) {
                            transactionCount++;
                        }
                    });
                }
            }

            const tps = transactionCount / measurementPeriod;
            const BlockRate = (endBlockNum-startBlockNum)/measurementPeriod
            const timestamp = new Date().toISOString();
            console.log(`Throughput (TPS): ${tps}`);
            fs.appendFileSync(tpsAndLatencyLog, `Throughput (TPS): ${tps} at ${timestamp}\n`);
            fs.appendFileSync(tpsAndLatencyLog, `Blocks Produced: ${endBlockNum-startBlockNum}, Block Production Rate: ${BlockRate}/sec\n`);
        } catch (error) {
            console.error(`Error measuring throughput for:`, error);
        }
    }
    
}

module.exports = executeTron;
