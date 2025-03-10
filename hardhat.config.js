require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

console.log("QUICKNODE_URI:", process.env.QUICKNODE_URI);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Present" : "Missing"); // error handling

/** @type import('hardhat/config').HardhatUserConfig */
const solc = require("solc");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.QUICKNODE_URI,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
