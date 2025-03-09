const main = async () => {
  const [owner, user1, user2] = await hre.ethers.getSigners();
  
  // Deploy the contract
  const FeedbackDAppFactory = await hre.ethers.getContractFactory("FeedbackDApp");
  const feedbackDApp = await FeedbackDAppFactory.deploy();
  await feedbackDApp.waitForDeployment();
  
  console.log("FeedbackDApp deployed to:", feedbackDApp.target);
  
  // Get total feedback (should be 0)
  let feedbackCount = await feedbackDApp.getTotalFeedback();
  console.log("Initial feedback count:", feedbackCount);
  
  // Add some feedback
  let txn = await feedbackDApp.addFeedback("This is the first feedback!");
  await txn.wait();
  
  // Add feedback from another user
  txn = await feedbackDApp.connect(user1).addFeedback("Great DApp, I love it!");
  await txn.wait();
  
  // Add one more feedback
  txn = await feedbackDApp.connect(user2).addFeedback("Could use some improvements.");
  await txn.wait();
  
  // Get updated feedback count
  feedbackCount = await feedbackDApp.getTotalFeedback();
  console.log("Updated feedback count:", feedbackCount);
  
  // Get all feedback
  const allFeedback = await feedbackDApp.getAllFeedback();
  console.log("All feedback:", allFeedback);
};

const runMain = async () => {
  try {
      await main();
      process.exit(0);
  } catch (error) {
      console.log(error);
      process.exit(1);
  }
};

runMain();