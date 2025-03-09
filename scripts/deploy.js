const main = async () => {
  // Get the deployer's signer object
  const [deployer] = await hre.ethers.getSigners();
  
  // Get the deployer's balance
  const accountBalance = await deployer.provider.getBalance(deployer.address);
  
  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account Balance: ", accountBalance.toString());
  
  // Deploy the contract
  const FeedbackDAppFactory = await hre.ethers.getContractFactory("FeedbackDApp");
  const feedbackDApp = await FeedbackDAppFactory.deploy();
  
  console.log("FeedbackDApp contract deployed to:", feedbackDApp.target);
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