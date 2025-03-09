require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
const solc = require("solc");

module.exports = {
  solidity: {
    version: "0.8.28", // Or another version you prefer
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: process.env.QUICKNODE_URI,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
};

task("Accounts", "Prints the List of Accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  for (const account of accounts) {
    console.log(account.address);
  }
})