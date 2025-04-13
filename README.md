# MyDeFi

# Decentralized Exchange (DEX) & ERC20 Token Smart Contracts

![Solidity](https://img.shields.io/badge/Solidity-0.8.x-blue?logo=solidity)
![License](https://img.shields.io/badge/License-MIT-green)

A decentralized exchange (DEX) system with an ERC20-compliant token (`KerwinToken`) and an order-matching exchange platform (`Exchange`).

## Contracts Overview

### 1. KerwinToken.sol
​**ERC20 Token Implementation**​  
- Name: `KerwinToken`
- Symbol: `KWT`
- Decimals: `18`
- Total Supply: `1,000,000 KWT` (minted to deployer)

#### Key Features:
- ERC20 standard functions (`transfer`, `approve`, `transferFrom`)
- SafeMath integration (for Solidity <0.8.0 compatibility)
- Events: `Transfer`, `Approval`

### 2. Exchange.sol
​**Decentralized Exchange Platform**​  
- Supports ETH and ERC20 token trading
- Fee mechanism (configurable fee account & percentage)
- Order book with create/cancel/fill functionality

#### Key Features:
- Deposit/Withdraw ETH and ERC20 tokens
- Maker-Taker order matching
- Fee calculation on order fulfillment
- Event logging for all operations

# Usage

## 1. Deploy Contracts

```javascript
// Hardhat deployment script
async function deploy() {
  const [deployer] = await ethers.getSigners();
  
  // Deploy KerwinToken
  const Token = await ethers.getContractFactory("KerwinToken");
  const token = await Token.deploy();
  
  // Deploy Exchange (5% fee)
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(deployer.address, 5);
}```

## 2. Deposit Funds

### ETH Deposit:  
```javascript
await exchange.depositEther({ value: ethers.utils.parseEther("1.0") });
## Token Deposit
  
```javascript
// Approve first
await token.approve(exchange.address, ethers.utils.parseUnits("100", 18));
// Then deposit
await exchange.depositToken(token.address, ethers.utils.parseUnits("100", 18));
```

## 3. Create Order

```javascript
// Create order: Sell 1 ETH for 100 KWT
await exchange.makeOrder(
  ethers.constants.AddressZero, // ETH
  ethers.utils.parseEther("1"),
  token.address,
  ethers.utils.parseUnits("100", 18)
);
```
## 4. Fill Order

```javascript
// Fill order ID 1
await exchange.fillOrder(1);
## Security Considerations

### KerwinToken
- Uses SafeMath for arithmetic operations (when using Solidity <0.8.0)
- Implements ERC20 standard safely
- Includes allowance protection patterns

### Exchange
- Reentrancy protection through checks-effects-interactions
- Validates:
  - Token address ≠ address(0)
  - Order existence before execution
  - Sufficient balances before transactions
- Uses `.call{value}()` instead of `.transfer()` for ETH withdrawals
```

## Key Events

| Event         | Description                          |
|---------------|--------------------------------------|
| Deposit       | Funds deposited to exchange          |
| Withdraw      | Funds withdrawn from exchange        |
| OrderCreated  | New order added to order book        |
| OrderCanceled | Order canceled by maker              |
| OrderFilled   | Order executed by taker              |

  
## Setup and Run Instructions

Follow these steps to set up and run the MyDeFi DApp:

### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or later)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)
- MetaMask (for wallet interaction)

### Step 1: Start the local blockchain
1. Launch Ganache to start a local Ethereum network
2. Ensure Ganache is running on `http://127.0.0.1:8545` (default port)

### Step 2: Deploy smart contracts
```bash
# Navigate to the dapp directory
cd dapp

# Deploy contracts to local network
truffle migrate
```

### Step 3: Start the payment backend
```bash
# Navigate to the payment directory
cd ../payment

# Start the payment server
node server.js
```

### Step 4: Start the frontend application
```bash
# Navigate to the dapp directory
cd ../dapp

# Install dependencies (if not already installed)
npm install

# Start the frontend application
npm run start
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

### Features
- ETH wallet and exchange management
- KWT token purchasing via PayPal
- Integration with your Ethereum wallet
