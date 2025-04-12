# Frontend-DAPP

### Project Structure
```plaintext
src/
├── assets/                   # Static assets
│   └── icons/               # Icon files
│
├── views/                   # View components
│   ├── Balance.js          # Asset management component
│   ├── Content.js          # Main content layout
│   └── Order.js           # Order management component
│
├── redux/                   # State management
│   ├── store.js           # Redux store configuration
│   └── slices/            # Redux slices
│       ├── balanceSlice.js # Balance state management
│       └── orderSlice.js   # Order state management
│
└── build/                  # Contract ABIs
    ├── KerwinToken.json   # Token contract ABI
    └── Exchange.json      # Exchange contract ABI
```

### Features

##### 1. Asset Management (Balance.js)
- View ETH and KWT balances
- Deposit ETH to exchange
- Withdraw ETH from exchange
- Real-time balance updates

##### 2. Order Management (Order.js)
- Create new orders
- View order history
- Cancel active orders
- Exchange rate calculator
- Order preview functionality

##### 3. Main Features
- Wallet connection
- Real-time updates
- Transaction confirmation
- Error handling
- Responsive design

### Getting Started

#### Prerequisites
```bash
# Required dependencies
npm install @reduxjs/toolkit react-redux antd web3 moment @ant-design/icons
```

#### Configuration
1. Connect to MetaMask 
2. Configure network settings in truffle-config.js
3. Deploy smart contracts
4. Update contract addresses in the application

#### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Components

#### Balance Component
- Displays wallet and exchange balances
- Handles deposits and withdrawals
- Manages asset transactions

```javascript
// Example usage
import Balance from './views/Balance';
<Balance />
```

#### Order Component
- Manages order creation and execution
- Displays order history
- Provides exchange rate calculations

```javascript
// Example usage
import Order from './views/Order';
<Order />
```

### State Management

#### Balance Slice
- Manages asset balances
- Handles balance updates
- Tracks transaction status

#### Order Slice
- Manages order data
- Handles order status
- Tracks order history

### Smart Contract Integration

#### Contract Functions
1. **Deposit**
```javascript
await web.exchange.methods.depositEther().send({
    from: account,
    value: amount
});
```

2. **Withdraw**
```javascript
await web.exchange.methods.withdrawEther(amount)
    .send({ from: account });
```

3. **Create Order**
```javascript
await web.exchange.methods.makeOrder(
    tokenAddress,
    amountKWT,
    amountETH
).send({ from: account });
```

## Contact
Feng Yujie 

