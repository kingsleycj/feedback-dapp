
// Smart contract details
const contractABI = [
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
];

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

// DOM Elements
const connectWalletButton = document.getElementById("connectWalletButton");
const submitFeedbackButton = document.getElementById("submitFeedbackButton");
const feedbackText = document.getElementById("feedbackText");
const feedbackContainer = document.getElementById("feedbackContainer");
const noFeedbackMessage = document.getElementById("noFeedbackMessage");
const walletSection = document.getElementById("walletSection");
const feedbackSection = document.getElementById("feedbackSection");

// App State
let currentAccount = null;
let provider = null;
let signer = null;
let feedbackContract = null;

// Initialize the app (only sets up event listeners, no auto-connect)
function initApp() {
  setupEventListeners();
}

// Check if wallet is connected (but does NOT auto-connect)
async function checkIfWalletIsConnected() {
  try {
    if (!window.ethereum) {
      console.log("MetaMask is not installed!");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      console.log("Wallet detected:", accounts[0]);
      currentAccount = accounts[0]; // Store it, but don't auto-connect
    } else {
      console.log("No wallet connected yet.");
    }
  } catch (error) {
    console.error("Error checking wallet connection:", error);
  }
}

// Connect wallet only when the button is clicked
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this DApp!");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    currentAccount = accounts[0];

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    feedbackContract = new ethers.Contract(contractAddress, contractABI, signer);

    updateUIAfterWalletConnect();
    setupContractEvents();
    console.log("Wallet connected:", currentAccount);
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet. Please check the console for details.");
  }
}

// Update UI after wallet connection
function updateUIAfterWalletConnect() {
  walletSection.innerHTML = `
    <div class="connected-address">
      Connected: ${formatAddress(currentAccount)}
    </div>
  `;
  feedbackSection.style.display = "block";
}

// Format address for display
function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Submit feedback to the contract
async function submitFeedback() {
  try {
    const message = feedbackText.value.trim();

    if (!message) {
      alert("Please enter some feedback before submitting.");
      return;
    }

    if (!currentAccount) {
      alert("No wallet connected. Please connect your wallet first.");
      return;
    }

    if (!feedbackContract) {
      alert("Contract not initialized. Please try reconnecting.");
      return;
    }

    // Disable button while submitting
    submitFeedbackButton.disabled = true;
    submitFeedbackButton.innerHTML = "Sending... <span class='spinner'></span>";

    const tx = await feedbackContract.sendFeedback(message);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Transaction confirmed");

    feedbackText.value = "";
    submitFeedbackButton.disabled = false;
    submitFeedbackButton.textContent = "Submit Feedback";
  } catch (error) {
    console.error("Error submitting feedback:", error);
    
    // Display a more readable error message
    alert("Failed to submit feedback. Please check your wallet and try again.");
    
    submitFeedbackButton.disabled = false;
    submitFeedbackButton.textContent = "Submit Feedback";
  }
}


// Listen for contract events
function setupContractEvents() {
  if (!feedbackContract) return;

  feedbackContract.on("NewFeedback", (from, message, timestamp) => {
    console.log("New Feedback:", from, message, timestamp);
    addFeedbackToUI(from, message, new Date(timestamp.toNumber() * 1000));
  });
}

// Add feedback to the UI
function addFeedbackToUI(address, message, timestamp) {
  const feedbackItem = document.createElement("div");
  feedbackItem.className = "feedbackItem";

  feedbackItem.innerHTML = `
    <div class="feedbackHeader">
      <p class="feedbackAddress">${formatAddress(address)}</p>
      <p class="feedbackTime">${timestamp.toLocaleString()}</p>
    </div>
    <p class="feedbackMessage">${message}</p>
  `;

  feedbackContainer.appendChild(feedbackItem);
  noFeedbackMessage.style.display = "none";
}

// Set up UI event listeners
function setupEventListeners() {
  connectWalletButton.addEventListener("click", connectWallet);
  submitFeedbackButton.addEventListener("click", submitFeedback);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        location.reload(); // Reload to reset UI if user disconnects
      } else {
        connectWallet(accounts[0]);
      }
    });

    window.ethereum.on("chainChanged", () => {
      location.reload(); // Reload if the network changes
    });
  }
}

// Run the app once the DOM is ready
document.addEventListener("DOMContentLoaded", initApp);
