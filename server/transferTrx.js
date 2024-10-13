const TronWeb = require('tronweb');
require('dotenv').config();

// Initialize TronWeb instance (connect to Shasta testnet or mainnet)
const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',  // You can change this to 'https://api.trongrid.io' for mainnet
    privateKey: "C1E7CC8523BB141495F41DA7724B66304B786F90B45B33DC0E028903ADCF8A46"   // Replace with the private key or use from .env
});

// Sender's private key (wallet that holds TRX)
const senderPrivateKey = "C1E7CC8523BB141495F41DA7724B66304B786F90B45B33DC0E028903ADCF8A46"; // Put this in .env file for security

// Recipient's address (wallet that will receive the TRX)
const recipientAddress = "TS7Nfzy7aNK7sdhZEUxTnnbE1ArBarkcNV";  // Replace with recipient address

// Amount to send (in TRX, not in sun)
const amountInTRX = 1000; // Send 1 TRX (you can adjust this amount)

// Function to send TRX
async function sendTRX() {
    try {
        // Convert amount from TRX to sun (1 TRX = 1e6 sun)
        const amountInSun = tronWeb.toSun(amountInTRX);

        // Create the transaction
        const tradeObj = await tronWeb.transactionBuilder.sendTrx(
            recipientAddress,    // Recipient address
            amountInSun,         // Amount to send in sun
            tronWeb.address.fromPrivateKey(senderPrivateKey)  // Sender address derived from private key
        );

        // Sign the transaction
        const signedTxn = await tronWeb.trx.sign(tradeObj, senderPrivateKey);

        // Broadcast the transaction
        const receipt = await tronWeb.trx.sendRawTransaction(signedTxn);

        console.log("Transaction Result:", receipt);
        if (receipt.result) {
            console.log("Transaction Successful!");
        } else {
            console.log("Transaction Failed!");
        }
    } catch (error) {
        console.error("Error sending TRX:", error);
    }
}

// Call the function to send TRX
sendTRX();
