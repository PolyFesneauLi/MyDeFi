# MyDeFi

## Setup and Run Instructions

Follow these steps to set up and run the MyDeFi DApp:

### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or later)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

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
