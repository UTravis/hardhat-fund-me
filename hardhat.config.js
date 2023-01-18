const { version } = require("ethers");

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require('hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require('solidity-coverage')

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const NODE_ENDPOINT = process.env.GOERLI_RPC || "https://goerli/example";
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY || "0xkey";
const COINMARKET_API = process.env.COINMARKETCAP;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.17",
  solidity: {
    compilers: [ {version: "0.8.17"}, {version: "0.6.6"}]
  },
  networks:{
    goerli: {
      url: NODE_ENDPOINT,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6
    }
  },
  etherscan: { apiKey: ETHERSCAN_API },
  gasReporter: {
    currency: 'USD',
    enabled: true,
    coinmarketcap: COINMARKET_API
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  }
};
