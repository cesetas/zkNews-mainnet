import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
import "hardhat-gas-reporter";
import "hardhat-dependency-compiler";
import { HardhatUserConfig } from "hardhat/config";
import "./tasks/deploy";

dotenv.config({ path: ".env.local" });

module.exports = {
  defaultNetwork: "matic",
  networks: {
    hardhat: {},
    matic: {
      url: process.env.NEXT_PUBLIC_TEST_URL,
      accounts: [process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.NEXT_PUBLIC_MAIN_URL,
      accounts: [process.env.NEXT_PUBLIC_MAIN_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
