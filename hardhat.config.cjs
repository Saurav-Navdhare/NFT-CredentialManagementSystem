require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;
const CARADONA_PRIVATE_KEY = process.env.CARADONA_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  paths: {
    artifacts: "./client/src/artifacts",
  },
  settings: {

    optimizer: {

      enabled: true,

      runs: 1000

    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [PRIVATE_KEY],
    },
    zkevm: {
      url: "https://rpc.cardona.zkevm-rpc.com",
      chainId: 2442,
      accounts: [CARADONA_PRIVATE_KEY],
    }
  },
};
