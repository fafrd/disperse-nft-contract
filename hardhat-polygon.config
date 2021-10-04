require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

// const fs = require('fs');
// const privateKey = fs.readFileSync(".secret").toString().trim();
module.exports = {
  defaultNetwork: "polygon",
  networks: {
    hardhat: {
    },
      polygon: {
        url: "https://rpc-mumbai.maticvigil.com/v1/bbcd12537cd9f228a8a54b0bc8b4f4db124000d5",
        accounts: [process.env.PRIVATE_KEY],
        // HttpNetworkConfig:80001
      }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

};
