const { ethers } = require("ethers");
require('dotenv').config();
const provider = new ethers.providers.JsonRpcProvider(process.env.Holesky_Connect);

// Sender's private key (wallet that holds faucet tokens)
const senderPrivateKey = "0x8934ed8022a69c665ecf376548beacb3cc55b6079ce4bdefdd9577fe515ee268"; // Replace with the actual private key
const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

// Recipient's address (wallet that will receive the tokens)
const recipientAddress = "0xc3207E1AAbF450e2adBab85a86fB466df1921D7F"; // Replace with the recipient's address

const amountInEther = "0.5";

// Function to transfer faucet tokens
async function transferFaucetTokens() {
    try {
        // Convert the amount to BigNumber in wei
        const amountInWei = ethers.utils.parseUnits(amountInEther, "ether");

        // Create a transaction object
        const tx = {
            to: recipientAddress,   // Recipient's address
            value: amountInWei      // Amount to send in wei
        };

        // Send the transaction
        const transactionResponse = await senderWallet.sendTransaction(tx);

        console.log("Transaction hash:", transactionResponse.hash);

        // Wait for the transaction to be mined
        await transactionResponse.wait();

        console.log("Transaction mined!");
    } catch (error) {
        console.error("Error while transferring tokens:", error);
    }
}

transferFaucetTokens();
