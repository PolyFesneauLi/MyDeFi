// PayPal Integration for KWT Purchase
// Single PayPal button instance
import KerwinTokenArtifact from '../build/KerwinToken.json';
import Web3 from 'web3';

let paypalButtonInstance = null;
let currentKwtAmount = 1;
let currentRate = 100;
let recipientAddress = '';

// Store a reference to the web3 and contract instances
let web3;
let kerwinTokenContract;

// Initialize web3 connection
const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    // Fallback to local Ganache instance
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  }
  
  return web3;
};

// Initialize KerwinToken contract
const initContract = async () => {
  try {
    if (!web3) {
      web3 = await initWeb3();
    }
    
    // Get network ID
    const networkId = await web3.eth.net.getId();
    
    // Get deployed contract address
    const deployedNetwork = KerwinTokenArtifact.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }
    
    // Create contract instance
    kerwinTokenContract = new web3.eth.Contract(
      KerwinTokenArtifact.abi,
      deployedNetwork.address
    );
    
    console.log("Contract initialized at:", deployedNetwork.address);
    return kerwinTokenContract;
  } catch (error) {
    console.error("Failed to initialize contract:", error);
    throw error;
  }
};

export function initializePayPalButton(kwtAmount = 1, exchangeRate = 100, ethAddress = '') {
  try {
    // Store current values
    currentKwtAmount = kwtAmount;
    currentRate = exchangeRate;
    recipientAddress = ethAddress;
    
    // Calculate HKD amount based on KWT amount and rate
    const hkdAmount = (kwtAmount * exchangeRate).toFixed(2);
    console.log(`Setting PayPal values: ${kwtAmount} KWT (${hkdAmount} HKD)`);
    
    // Initialize web3 and contract
    initWeb3().then(() => {
      initContract().catch(error => {
        console.error("Contract initialization error:", error);
      });
    });
    
    // Check if PayPal SDK is loaded
    if (!window.paypal) {
      console.log("PayPal SDK not loaded yet, waiting...");
      setTimeout(() => initializePayPalButton(kwtAmount, exchangeRate, ethAddress), 500);
      return;
    }
    
    // Only create button instance if it doesn't exist
    if (!paypalButtonInstance) {
      createPayPalButtonInstance();
    }
  } catch (error) {
    console.error("PayPal initialization error:", error);
    resultMessage(
      `<div class="error-message">
        <div class="error-header">Initialization Failed</div>
        <div class="error-details">
          <p>PayPal payment system initialization failed.</p>
          <p>Error message: ${error.message}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      </div>`
    );
  }
}

// Mint KWT tokens after successful payment
async function mintKwtTokens(amount, transactionId) {
  try {
    // Check if recipient address is provided
    if (!recipientAddress || !web3.utils.isAddress(recipientAddress)) {
      throw new Error("Invalid Ethereum address");
    }
    
    // Initialize contract if not already done
    if (!kerwinTokenContract) {
      await initContract();
    }
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      throw new Error("No Ethereum accounts available");
    }
    
    console.log(`Minting ${amount} KWT tokens to ${recipientAddress}`);
    
    // Convert amount to wei (tokens have 18 decimals)
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // Call mint function
    const result = await kerwinTokenContract.methods.mint(recipientAddress, amountWei)
      .send({ from: accounts[0] });
      
    console.log("Mint transaction result:", result);
    return {
      success: true,
      txHash: result.transactionHash,
      tokenAmount: amount
    };
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
}

// API server URL for proxy setup
const API_BASE = "/api";

function createPayPalButtonInstance() {
  try {
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.log("PayPal container not ready yet, waiting...");
      setTimeout(createPayPalButtonInstance, 500);
      return;
    }
    
    // Clear container and any existing messages
    container.innerHTML = '';
    const messageContainer = document.querySelector("#result-message");
    if (messageContainer) {
      messageContainer.innerHTML = '';
    }
    
    paypalButtonInstance = window.paypal
      .Buttons({
        style: {
          shape: "rect",
          layout: "vertical",
          color: "gold",
          label: "paypal",
        },

        // This function is called when PayPal button is clicked
        createOrder: function() {
          // Always use the latest values from the global variables
          return createPaypalOrder();
        },

        onApprove: function(data, actions) {
          return capturePaypalOrder(data);
        },
        
        onError: function(err) {
          console.error("PayPal button error:", err);
          resultMessage(
            `<div class="error-message">
              <div class="error-header">PayPal Error</div>
              <div class="error-details">
                <p>An error occurred during PayPal processing.</p>
                <p>Error message: ${err}</p>
                <p>Please try again later or use another payment method.</p>
              </div>
            </div>`
          );
        },
        
        onCancel: function() {
          console.log("Payment cancelled");
          resultMessage(
            `<div class="warning-message">
              <div class="warning-header">Transaction Cancelled</div>
              <div class="warning-details">
                <p>You have cancelled the payment process.</p>
                <p>If you encountered any issues, please contact our customer support team.</p>
              </div>
            </div>`
          );
        }
      });
      
    // Render the PayPal button to the container
    paypalButtonInstance.render("#paypal-button-container")
      .catch(err => {
        paypalButtonInstance = null; // Reset on error
        console.error("PayPal render error:", err);
        resultMessage(
          `<div class="error-message">
            <div class="error-header">Render Failed</div>
            <div class="error-details">
              <p>Failed to render PayPal payment button.</p>
              <p>Error message: ${err}</p>
              <p>Please check your network connection and refresh the page.</p>
            </div>
          </div>`
        );
      });
  } catch (error) {
    paypalButtonInstance = null; // Reset on error
    console.error("Button creation error:", error);
    resultMessage(
      `<div class="error-message">
        <div class="error-header">Button Creation Failed</div>
        <div class="error-details">
          <p>An error occurred while creating the PayPal payment button.</p>
          <p>Error message: ${error.message}</p>
          <p>Please refresh the page and try again.</p>
        </div>
      </div>`
    );
  }
}

// Separate function to create order with current amount
async function createPaypalOrder() {
  try {
    // Check if Ethereum address is valid
    if (!recipientAddress || !web3.utils.isAddress(recipientAddress)) {
      resultMessage(
        `<div class="error-message">
          <div class="error-header">Invalid Ethereum Address</div>
          <div class="error-details">
            <p>Please enter a valid Ethereum address before proceeding with payment.</p>
          </div>
        </div>`
      );
      throw new Error("Invalid Ethereum address");
    }
    
    // Always get the current values from global variables
    const kwtAmount = currentKwtAmount;
    const hkdAmount = (kwtAmount * currentRate).toFixed(2);
    
    console.log(`Creating order for ${kwtAmount} KWT at ${hkdAmount} HKD`);
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            id: "KWT_TOKEN",
            quantity: kwtAmount.toString(),
            price: hkdAmount
          },
        ],
      }),
    });

    console.log("Order response status:", response.status);
    const orderData = await response.json();
    console.log("Order data:", orderData);

    if (orderData.id) {
      return orderData.id;
    }
    const errorDetail = orderData?.details?.[0];
    const errorMessage = errorDetail
      ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
      : JSON.stringify(orderData);

    throw new Error(errorMessage);
  } catch (error) {
    console.error("Create order error:", error);
    resultMessage(
      `<div class="error-message">
        <div class="error-header">Order Creation Failed</div>
        <div class="error-details">
          <p>Unable to create PayPal payment order.</p>
          <p>Error message: ${error.message}</p>
          <p>Please check your network connection or try again later.</p>
        </div>
      </div>`
    );
    throw error;
  }
}

// Separate function to capture order
async function capturePaypalOrder(data) {
  try {
    console.log("Capturing order:", data.orderID);
    
    // Show processing message
    resultMessage(
      `<div class="processing-message">
        <div class="processing-header">Processing Payment</div>
        <div class="processing-details">
          <p>Your payment is being processed. Please wait...</p>
        </div>
      </div>`
    );
    
    const response = await fetch(`${API_BASE}/orders/${data.orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const orderData = await response.json();
    console.log("Capture response:", orderData);
    
    const errorDetail = orderData?.details?.[0];

    if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
      throw new Error("Payment declined. Please try another payment method.");
    } else if (errorDetail) {
      throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
    } else if (!orderData.purchase_units) {
      throw new Error(JSON.stringify(orderData));
    } else {
      const transaction =
        orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
        orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
      
      // Show processing blockchain transaction message
      resultMessage(
        `<div class="processing-message">
          <div class="processing-header">Minting Tokens</div>
          <div class="processing-details">
            <p>Payment successful. Now minting your KWT tokens on blockchain...</p>
            <p>Please do not close this window.</p>
          </div>
        </div>`
      );
      
      try {
        // Call contract to mint tokens
        const mintResult = await mintKwtTokens(currentKwtAmount, transaction.id);
        
        // Enhanced success message with more details including blockchain tx
        resultMessage(
          `<div class="success-message">
            <div class="success-header">Transaction Successful</div>
            <div class="success-details">
              <div class="success-row">
                <span class="success-label">Transaction ID:</span>
                <span class="success-value">${transaction.id}</span>
              </div>
              <div class="success-row">
                <span class="success-label">Amount:</span>
                <span class="success-value">${transaction.amount.value} ${transaction.amount.currency_code}</span>
              </div>
              <div class="success-row">
                <span class="success-label">KWT Tokens:</span>
                <span class="success-value">${currentKwtAmount}</span>
              </div>
              <div class="success-row">
                <span class="success-label">Payment Status:</span>
                <span class="success-value">${transaction.status}</span>
              </div>
              <div class="success-row">
                <span class="success-label">Payment Time:</span>
                <span class="success-value">${new Date().toLocaleString()}</span>
              </div>
              <div class="success-row">
                <span class="success-label">Recipient:</span>
                <span class="success-value">${recipientAddress}</span>
              </div>
              <div class="success-row">
                <span class="success-label">Blockchain TX:</span>
                <span class="success-value">${mintResult.txHash}</span>
              </div>
            </div>
            <div class="success-footer">KWT tokens have been successfully added to your wallet</div>
          </div>`
        );
      } catch (contractError) {
        // Show error if contract call fails
        resultMessage(
          `<div class="error-message">
            <div class="error-header">Token Minting Failed</div>
            <div class="error-details">
              <p>Payment was successful, but token minting failed.</p>
              <p>Error: ${contractError.message}</p>
              <p>Please contact support with your transaction ID: ${transaction.id}</p>
            </div>
          </div>`
        );
        throw contractError;
      }
    }
  } catch (error) {
    console.error("Capture order error:", error);
    resultMessage(
      `<div class="error-message">
        <div class="error-header">Payment Failed</div>
        <div class="error-details">
          <p>We're sorry, your transaction could not be completed.</p>
          <p>Error message: ${error.message}</p>
          <p>Please try again later or contact customer support for assistance.</p>
        </div>
      </div>`
    );
  }
}

// Reset the button state - can be called when modal is closed
export function resetPayPalButton() {
  paypalButtonInstance = null;
  recipientAddress = '';
}

// Update recipient address
export function updateRecipientAddress(address) {
  recipientAddress = address;
}

// Display result message
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  if (container) {
    container.innerHTML = message;
  } else {
    console.error("Result message container not found");
  }
} 