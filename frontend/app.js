const contractABI = [
  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "message",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "NewFeedback",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "feedbacks",
      "outputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllFeedbacks",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct FeedbackDApp.Feedback[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getFeedbackCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_message",
          "type": "string"
        }
      ],
      "name": "sendFeedback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
];

const contractAddress = process.env.CONTRACT_ADDRESS;

// DOM Elements
const connectWalletButton = document.getElementById('connectWalletButton');
const submitFeedbackButton = document.getElementById('submitFeedbackButton');
const feedbackText = document.getElementById('feedbackText');
const feedbackContainer = document.getElementById('feedbackContainer');
const noFeedbackMessage = document.getElementById('noFeedbackMessage');
const walletSection = document.getElementById('walletSection');
const feedbackSection = document.getElementById('feedbackSection');

// App State
let currentAccount = null;
let provider = null;
let signer = null;
let feedbackContract = null;

// Initialize the app
function initApp() {
  checkIfWalletIsConnected();
  setupEventListeners();
}

// Check if wallet is connected
async function checkIfWalletIsConnected() {
  try {
    // Check if window.ethereum is present (MetaMask)
    if (!window.ethereum) {
      console.log("Make sure you have MetaMask installed!");
      return;
    }
    
    // Check if we're authorized to access the user's wallet
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      connectWallet(account);
    } else {
      console.log("No authorized account found");
    }
  } catch (error) {
    console.error("Error checking wallet connection:", error);
  }
}

// Connect to wallet and setup contracts
async function connectWallet(accountAddress = null) {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this DApp!");
      return;
    }
    
    // Get account
    let account;
    if (!accountAddress) {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      account = accounts[0];
    } else {
      account = accountAddress;
    }
    
    // Setup ethers
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    feedbackContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    
    // Update UI
    currentAccount = account;
    updateUIAfterWalletConnect();
    
    // Get all feedback
    await getAllFeedback();
    
    // Listen for new feedback events
    setupContractEvents();
    
    console.log("Wallet connected:", account);
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet. Please check the console for more details.");
  }
}

// Update UI after wallet connection
function updateUIAfterWalletConnect() {
  walletSection.innerHTML = `
    <div class="connected-address">
      Connected: ${formatAddress(currentAccount)}
    </div>
  `;
  feedbackSection.style.display = 'block';
}

// Format address for display
function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get all feedback from contract
async function getAllFeedback() {
  try {
    if (!feedbackContract) return;
    
    // Call the contract to get all feedback
    const feedbacks = await feedbackContract.getAllFeedback();
    
    // Check if we got any feedback
    if (feedbacks.length > 0) {
      noFeedbackMessage.style.display = 'none';
    } else {
      noFeedbackMessage.style.display = 'block';
    }
    
    // Clear current feedback list
    feedbackContainer.innerHTML = '';
    
    // Add each feedback to the UI
    feedbacks.forEach(feedback => {
      addFeedbackToUI(
        feedback.user,
        feedback.message,
        new Date(feedback.timestamp.toNumber() * 1000)
      );
    });
  } catch (error) {
    console.error("Error getting feedback:", error);
  }
}

// Add a single feedback item to the UI
function addFeedbackToUI(address, message, timestamp) {
  const feedbackItem = document.createElement('div');
  feedbackItem.className = 'feedbackItem';
  
  feedbackItem.innerHTML = `
    <div class="feedbackHeader">
      <p class="feedbackAddress">${formatAddress(address)}</p>
      <p class="feedbackTime">${timestamp.toLocaleString()}</p>
    </div>
    <p class="feedbackMessage">${message}</p>
  `;
  
  feedbackContainer.appendChild(feedbackItem);
  noFeedbackMessage.style.display = 'none';
}

// Submit feedback to the contract
async function submitFeedback() {
  try {
    const message = feedbackText.value.trim();
    
    if (!message) {
      alert("Please enter some feedback before submitting.");
      return;
    }
    
    if (!feedbackContract) {
      alert("Wallet not connected properly. Please try reconnecting.");
      return;
    }
    
    // Disable submit button and show loading state
    submitFeedbackButton.disabled = true;
    submitFeedbackButton.innerHTML = 'Sending... <span class="spinner"></span>';
    
    // Call the contract function to add feedback
    const tx = await feedbackContract.sendFeedback(message);
    console.log("Transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    await tx.wait();
    console.log("Transaction confirmed");
    
    // Clear input and reset button
    feedbackText.value = '';
    submitFeedbackButton.disabled = false;
    submitFeedbackButton.textContent = 'Submit Feedback';
    
    // We don't need to manually update the UI as our event listener will catch it
  } catch (error) {
    console.error("Error submitting feedback:", error);
    
    // Reset button state
    submitFeedbackButton.disabled = false;
    submitFeedbackButton.textContent = 'Submit Feedback';
    
    // Show error to user
    alert("There was an error submitting your feedback. Please try again.");
  }
}

// Setup contract events
function setupContractEvents() {
  if (!feedbackContract) return;
  
  // Listen for the NewFeedback event
  feedbackContract.on("NewFeedback", (from, message, timestamp) => {
    console.log("New Feedback:", from, message, timestamp);
    
    // Add the new feedback to the UI
    addFeedbackToUI(
      from, 
      message, 
      new Date(timestamp.toNumber() * 1000)
    );
  });
}

// Setup UI event listeners
function setupEventListeners() {
  // Connect wallet button
  connectWalletButton.addEventListener('click', () => connectWallet());
  
  // Submit feedback button
  submitFeedbackButton.addEventListener('click', submitFeedback);
  
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        location.reload(); // Reload the page to reset the UI
      } else {
        // User switched accounts
        connectWallet(accounts[0]);
      }
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', () => {
      // Chain changed, reload the page
      location.reload();
    });
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);