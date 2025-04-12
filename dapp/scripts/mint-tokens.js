const KerwinToken = artifacts.require("KerwinToken");
const Web3 = require('web3');

/**
 * Script to mint KWT tokens to a specific address
 * Usage: truffle exec scripts/mint-tokens.js <recipient_address> <amount_in_kwt>
 */
module.exports = async function(callback) {
  try {
    // Get command line arguments
    const args = process.argv.slice(4);
    if (args.length < 2) {
      console.error('Please provide recipient address and amount of KWT tokens to mint');
      console.error('Usage: truffle exec scripts/mint-tokens.js <recipient_address> <amount_in_kwt>');
      return callback(new Error('Invalid arguments'));
    }

    const recipient = args[0];
    const amountInKwt = args[1];

    // Validate recipient address
    if (!Web3.utils.isAddress(recipient)) {
      return callback(new Error(`Invalid Ethereum address: ${recipient}`));
    }

    // Convert KWT amount to wei (considering 18 decimals)
    const amountInWei = Web3.utils.toWei(amountInKwt, 'ether');
    console.log(`Converting ${amountInKwt} KWT to ${amountInWei} wei`);
    
    // Get deployed KerwinToken instance
    const token = await KerwinToken.deployed();
    console.log(`Using KerwinToken at address: ${token.address}`);
    
    // Get contract owner
    const owner = await token.owner();
    const accounts = await web3.eth.getAccounts();
    
    if (accounts[0].toLowerCase() !== owner.toLowerCase()) {
      return callback(new Error(`Current account ${accounts[0]} is not the contract owner ${owner}`));
    }
    
    console.log(`Minting ${amountInKwt} KWT tokens to ${recipient}...`);
    
    // Mint tokens
    const tx = await token.mint(recipient, amountInWei);
    
    console.log(`Transaction successful! Transaction hash: ${tx.tx}`);
    console.log(`Gas used: ${tx.receipt.gasUsed}`);
    
    // Get recipient balance after minting
    const balance = await token.balanceOf(recipient);
    console.log(`Updated balance of ${recipient}: ${Web3.utils.fromWei(balance.toString(), 'ether')} KWT`);
    
    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }
}; 