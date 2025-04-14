# Decentralized Exchange (DEX) & ERC20 Token Smart Contracts

## Setup and Run Instructions

Follow these steps to set up and run the MyDeFi DApp:

### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or later)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

### Compiled Docker Offered

https://drive.google.com/file/d/1LVsCR8kEJtF7vZtHXDnJazMSgQy251eV/view?usp=drive_link

```shell
docker load -i MyDeFi2.tar
docker images # will find mydefi2image in list
```

```shell
## create an docker with img
docker run -it -p 8545:8545 --name MyDeFi2 mydefi2image /bin/bash
cd /usr/workspace/Project/Final/MyDeFi/

# restart MyDefi2
docker exec -it -w /usr/workspace/Project/Final/MyDeFi MyDeFi2 /bin/bash
```

### Environment Setup

#### Step 1: Start the local blockchain

1. **Launch Ganache to start a local Ethereum network**

   ```shell
   ganache -d  # if in host
   ```

   ```shell
   ganache -d -h 0.0.0.0 # if in docker 
   ```

   

2. **Ensure Ganache is running on `Port 8545` (default port)**

   Expected shell output 

   ![image-20250413223701357](.\img\image-20250413223701357.png)

   

3. **Configuration of MetaMask**

   If server set on host 

   ```shell
   RPC url: http://127.0.0.1:8545/
   Chain ID : 1337
   ```

   if server set on docker

   ```shell
   RPC url: http://host.docker.internal:8545
   Chain ID :1337
   ```

   ​                                   <img src=".\img\image-20250413224534163.png" alt="image-20250413224534163" style="zoom:33%;" /><img src=".\img\image-20250413224412965.png" alt="image-20250413224412965" style="zoom:33%;" />

#### Step 2: Deploy smart contracts

```bash
cd dapp
npm install

cd ../payment
npm install

# Deploy contracts to local network
truffle migrate --reset
```

#### Step3 : Local test

```shell
truffle exec ./scripts/test-order.js
truffle exec ./scripts/test-tranfer.js
...
```

#### Step 4: Start the frontend

```bash
cd dapp
npm run start

# another terminal
cd ../payment
npm run start
```

The application should now be running at [http://localhost:3000](http://localhost:3000).



### Function Block Diagram

<img src=".\img\006fcabf9bb632dd64801f634e738cf.png" alt="006fcabf9bb632dd64801f634e738cf" style="zoom: 25%;" />

### Contracts Overview

#### 1. KerwinToken.sol

**ERC20 Token Implementation**

- Name: `KerwinToken`
- Symbol: `KWT`
- Decimals: `18`
- Total Supply: `1,000,000 KWT` (minted to deployer)

**Key Features:**

- ERC20 standard functions (`transfer`, `approve`, `transferFrom`)

- SafeMath integration (for Solidity <0.8.0 compatibility)

- Events: `Transfer`, `Approval`

  

#### 2. Exchange.sol

**Decentralized Exchange Platform**

- Supports ETH and ERC20 token trading
- Fee mechanism (configurable fee account & percentage)
- Order book with create/cancel/fill functionality

**Key Features:**

- Deposit/Withdraw ETH and ERC20 tokens

- Maker-Taker order matching

- Fee calculation on order fulfillment

- Event logging for all operations

  

### Key Events

| Event         | Description                   |
| ------------- | ----------------------------- |
| Deposit       | Funds deposited to exchange   |
| Withdraw      | Funds withdrawn from exchange |
| OrderCreated  | New order added to order book |
| OrderCanceled | Order canceled by maker       |
| OrderFilled   | Order executed by taker       |

