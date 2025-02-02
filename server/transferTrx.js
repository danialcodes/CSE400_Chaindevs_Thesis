const TronWeb = require('tronweb');
require('dotenv').config();

// Initialize TronWeb instance (connect to Shasta testnet or mainnet)


// Function to send TRX
async function sendTRX(key, address, amount) {

    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',  // You can change this to 'https://api.trongrid.io' for mainnet
        // privateKey: "C3536F0B6AD660BD9A259CC41037931FEC7DA39EABAD352B5347D76F49761A96"   // Replace with the private key or use from .env
        privateKey: key   // Replace with the private key or use from .env

    });
    
    // Sender's private key (wallet that holds TRX)
    // const senderPrivateKey = "C3536F0B6AD660BD9A259CC41037931FEC7DA39EABAD352B5347D76F49761A96"; // Put this in .env file for security
    const senderPrivateKey = key; // Put this in .env file for security

    
    // Recipient's address (wallet that will receive the TRX)
    // const recipientAddress = "TTrSVSxa7KFHwy6RN5RLQ1uRsNWWoHcMNJ"; 
    const recipientAddress = address;  // Replace with recipient address
     // Replace with recipient address
    
    // Amount to send (in TRX, not in sun)
    const amountInTRX = amount; // Send 1 TRX (you can adjust this amount)

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
sendTRX("AC8E89192ECD40386A69EC78B6AFB884397FE34A9E21FE3A983DD6DB0894A0E3","TLegoBqVBHLmVU3QXAscm4CfMGxVmZ3t6V",2000);
// exports.sendTRX = sendTRX;
