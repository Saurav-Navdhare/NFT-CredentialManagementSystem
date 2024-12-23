require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [PRIVATE_KEY],
    },
  },
};
