# Feedback DApp 

A lightweight decentralized application that allows users to submit and view feedback on the Ethereum blockchain, built with vanilla JavaScript.

## Overview

The Feedback DApp is a simple yet fully functional decentralized application that allows users to:
1. Connect their Ethereum wallet to the application
2. View feedback provided by other users
3. Submit their own feedback to the blockchain

This application is built using Solidity for the smart contract and vanilla JavaScript for the frontend interface.

## Requirements Fulfilled

### 1. Wallet Connection
✅ **Requirement**: Users should be able to connect their wallet to the DApp.

**Implementation**:
- The application integrates with MetaMask and other Ethereum wallets through the window.ethereum provider.
- A "Connect Wallet" button is prominently displayed when no wallet is connected.
- The application detects if the user already has an authorized wallet connection.
- Relevant code in `app.js`:
  ```javascript
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
      
      // Setup ethers and update UI
      // ...
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }
  ```

### 2. View Others' Feedback
✅ **Requirement**: Users should be able to see other people's feedback on the DApp.

**Implementation**:
- All feedback is stored on-chain and retrieved when the page loads.
- Feedback is displayed in a clean, user-friendly list format.
- Each feedback entry shows the user's wallet address (abbreviated) and timestamp.
- The smart contract provides a function to retrieve all feedback:
  ```solidity
  function getAllFeedback() public view returns (Feedback[] memory) {
      return feedbacks;
  }
  ```
- The frontend fetches and displays this data:
  ```javascript
  async function getAllFeedback() {
    try {
      if (!feedbackContract) return;
      
      // Call the contract to get all feedback
      const feedbacks = await feedbackContract.getAllFeedback();
      
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
  ```

### 3. Submit Feedback
✅ **Requirement**: Users should be able to send their own feedback.

**Implementation**:
- A text input area allows users to compose their feedback.
- A submit button triggers the blockchain transaction.
- Loading states prevent multiple submissions and provide user feedback.
- The smart contract stores feedback with the user's address and timestamp:
  ```solidity
  function addFeedback(string memory _message) public {
      feedbacks.push(Feedback({
          user: msg.sender,
          message: _message,
          timestamp: block.timestamp
      }));
      totalFeedback += 1;
      emit NewFeedback(msg.sender, _message, block.timestamp);
  }
  ```
- The frontend submits the transaction and handles the state:
  ```javascript
  async function submitFeedback() {
    try {
      const message = feedbackText.value.trim();
      
      // Call the contract function to add feedback
      const tx = await feedbackContract.addFeedback(message);
      await tx.wait();
      
      // Reset UI
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  }
  ```

## Technical Implementation

### Smart Contract
The `FeedbackDApp.sol` contract:
- Uses a struct to represent feedback (user address, message, timestamp)
- Stores feedback in an array for retrieval
- Tracks the total number of feedback submissions
- Emits events when new feedback is added
- Provides view functions to get feedback data

### Frontend
The vanilla JavaScript frontend:
- Connects to Ethereum via MetaMask or other wallet providers using ethers.js
- Provides a clean, responsive UI for viewing and submitting feedback
- Handles loading states and transaction confirmations
- Updates in real-time when new feedback is submitted via contract events
- Formats blockchain data for user-friendly display


### Prerequisites
- Node.js and npm (for contract deployment)
- MetaMask browser extension
- A web server for serving the frontend files (or you can use extensions like "Live Server" for VSCode)

### Smart Contract Deployment
1. Install dependencies:
   ```
   npm init -y
   npm install --save-dev hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
   ```

2. Initialize Hardhat:
   ```
   npx hardhat init
   ```

3. Deploy the contract:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. Note the deployed contract address and ABI in `frontend/app.js`.


### Live Link

- [FeedBack DApp Link](https://feedback-dapp-rho.vercel.app/)

### Frontend Setup
1. Create the following files:
   - `index.html`
   - `styles.css`
   - `app.js`

2. Update the `contractAddress` and `contractABI` values in `app.js` with your actual contract details.

3. Serve the frontend files using any web server.

4. Access the application through your browser.

## Usage
1. Open the application in your browser.
2. Click "Connect Wallet" to connect your Ethereum wallet.
3. View existing feedback in the "Community Feedback" section.
4. Enter your feedback in the text area and click "Submit Feedback".
5. Approve the transaction in your wallet.
6. Your feedback will appear in the list once the transaction is confirmed.

## Project Structure
```
feedback-dapp/
├── contracts/
│   └── FeedbackDApp.sol
├── scripts/
│   ├── deploy.js
│   └── run.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── hardhat.config.js
└── .gitignore
└── package.json
└── README.md
```

