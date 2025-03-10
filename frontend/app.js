const provider = new ethers.providers.Web3Provider(window.ethereum);

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "NewFeedback",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllFeedbacks",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "message", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
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
    "inputs": [{ "internalType": "string", "name": "_message", "type": "string" }],
    "name": "sendFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let feedbackContract;

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed. Please install it to use this feature.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts.length) throw new Error("No accounts returned from MetaMask.");
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    feedbackContract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Connected to wallet:", accounts[0]);
    setupContractEvents();
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    alert("Failed to connect wallet: " + error.message);
  }
}

function setupContractEvents() {
  if (!feedbackContract) return;
  feedbackContract.on("NewFeedback", (from, message, timestamp) => {
    console.log("New Feedback:", from, message, new Date(timestamp.toNumber() * 1000));
    addFeedbackToUI(from, message, new Date(timestamp.toNumber() * 1000));
  });
}

function addFeedbackToUI(from, message, timestamp) {
  const feedbackList = document.getElementById("feedback-list");
  const feedbackItem = document.createElement("li");
  feedbackItem.textContent = `From: ${from}, Message: ${message}, Time: ${timestamp}`;
  feedbackList.appendChild(feedbackItem);
}

document.getElementById("connectWalletButton").addEventListener("click", connectWallet);
