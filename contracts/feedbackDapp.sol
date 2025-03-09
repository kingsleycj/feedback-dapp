// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract FeedbackDApp {
    constructor() {
        console.log("Feedback DApp deployed!");
    }
    
    // Structure to store feedback
    struct Feedback {
        address user;
        string message;
        uint256 timestamp;
    }
    
    // Array to store all feedback
    Feedback[] public feedbacks;
    
    // Total feedback count
    uint public totalFeedback = 0;
    
    // Event to emit when feedback is added
    event NewFeedback(address indexed user, string message, uint256 timestamp);
    
    // Function to add feedback
    function addFeedback(string memory _message) public {
        // Create new feedback and add to array
        feedbacks.push(Feedback({
            user: msg.sender,
            message: _message,
            timestamp: block.timestamp
        }));
        
        // Increase feedback count
        totalFeedback += 1;
        
        // Emit event
        emit NewFeedback(msg.sender, _message, block.timestamp);
    }
    
    // Function to get all feedback
    function getAllFeedback() public view returns (Feedback[] memory) {
        return feedbacks;
    }
    
    // Function to get total feedback count
    function getTotalFeedback() public view returns (uint) {
        console.log("Total feedback: %s", totalFeedback);
        return totalFeedback;
    }
}