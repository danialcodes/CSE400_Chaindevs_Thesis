const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const executeEthereum = require('./EthereumParallel.js');
const executeTron = require('./TronParallel.js');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./utils/db.js');
const UserModel = require('./models/userModel.js');

connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.post('/test', async (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: 'Received the request.' });
    
});
app.post('/execute', async (req, res) => {
    // const a = await UserModel.create({ email: "danial@gmail.com" });
    // console.log(a);
    // res.status(200).json({ message: 'Received the request.' });
    
    const { networks, contractAddresses, abi, functionName, params, numberOfTransactions } = req.body;
    
    if (!networks || !contractAddresses || !abi || !functionName || !params || !numberOfTransactions) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // // Paths to the generated text files
    // const ethereumLogFile = path.join(__dirname, 'logs/Ethereum_logs_individual.txt');
    // const ethTPSLogFile = path.join(__dirname, 'logs/Eth_TPS&AvgLatency_log.txt');
    // const ethWalletResourceFile = path.join(__dirname, "logs/EthWalletResourceUsage.txt");
    // const ethResourceLogFile = path.join(__dirname, 'logs/Ethereum_Resource_Usage.txt');

    // const tronLogFile = path.join(__dirname, 'logs/Tron_logs_individual.txt');
    // const tronTPSLogFile = path.join(__dirname, 'logs/Tron_TPS&AvgLatency_log.txt');
    // const tronWalletResourceFile = path.join(__dirname, 'logs/TronWalletResourceUsage.txt');
    // const tronResourceLogFile = path.join(__dirname, 'logs/Tron_Resource_Usage.txt');


    // Function to delete old files
    // const deleteOldFiles = () => {
    //     const filesToDelete = [
    //         ethereumLogFile,
    //         ethTPSLogFile,
    //         ethWalletResourceFile,
    //         ethResourceLogFile,
    //         tronLogFile,
    //         tronTPSLogFile,
    //         tronWalletResourceFile,
    //         tronResourceLogFile,
    //     ];

    //     filesToDelete.forEach(file => {
    //         if (fs.existsSync(file)) { // Check if the file exists before trying to delete
    //             fs.unlinkSync(file);
    //             console.log(`Deleted old file: ${file}`);
    //         }
    //     });
    // };

    try {
        // Delete old log files before running the scripts
        // deleteOldFiles();

        // Run Ethereum and Tron scripts in parallel
        await Promise.all([
            executeEthereum(networks.Ethereum, contractAddresses.ethereum, abi, functionName, params, numberOfTransactions),
            executeTron(networks.Tron, contractAddresses.tron, abi, functionName, params, numberOfTransactions)
        ]);

        // Read file contents
        // const ethereumLogs = fs.readFileSync(ethereumLogFile, 'utf8');
        // const ethTPSLogs = fs.readFileSync(ethTPSLogFile, 'utf8');
        // const ethWalletResourceLogs = fs.readFileSync(ethWalletResourceFile, 'utf8');
        // const ethResourceLogs = fs.readFileSync(ethResourceLogFile, 'utf8');

        // const tronLogs = fs.readFileSync(tronLogFile, 'utf8');
        // const tronTPSLogs = fs.readFileSync(tronTPSLogFile, 'utf8');
        // const tronWalletResourceLogs = fs.readFileSync(tronWalletResourceFile, 'utf8');
        // const tronResourceLogs = fs.readFileSync(tronResourceLogFile, 'utf8');
        // Send the contents as response
        res.status(200).json({
            message: 'Transactions executed successfully.'
            // ethereumLogs,
            // ethTPSLogs,
            // ethWalletResourceLogs,
            // ethResourceLogs,
            // tronLogs,
            // tronTPSLogs,
            // tronWalletResourceLogs,
            // tronResourceLogs,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
