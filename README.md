# Final Project : zkNews

This project on which news and articles are published by its registered members, aims at giving users confidence to submit and to follow the news and/or articles as anonymously by help of Semaphore and ZKP in order to serve freedom of speech within a secure platform. There is also a reward mechanism which supports the survival of the system. And all users are able to encourage members publisihing on the system to do their job better.

- Demo video:
- Testnet site:
- 'Live'' site:

# How It Works

The frontend built with Next.js&React and the Contracts was deployed on Harmony blockchain. The three interfaces will come together to provide the users with a complete platform where they can anonymously vote a poll and the records will be stored on the blockchain.
No personally identifiable data is stored on the backend servers or the blockchain and each user is identified with their identity commitment that is either stored on the browser or by the user.

## Post news

- create
- eslint: { ignoreDuringBuilds: true },
  webpack5: true,

  // config.experiments = {
  // asyncWebAssembly: true,
  // syncWebAssembly: true,
  // layers: true,
  // };

## Like/Dislike the posts

- list

## Fund the posts

- fund a

## Withdrawal the funds

# Testing

`yarn test`

<img src="" width="800px" height="auto"/>

# Setup database (mongoDB)

Create t

# Test with Frontend UI

- `yarn install` to install all dependencies
- `yarn dev` to start a local node. Import a few of the test accounts into Metamask for testing purposes.
- `yarn deploy --network localhost` to deploy the smart contracts to the local node.

<img src="" width="800px" height="auto"/>

Copy the zkNews contract address to constants/configuration.json

Then, browse to http://localhost:3000 to access the frontend UI.

# Deploy to Harmony Testnet

Run `yarn deploy --network testnet`

# Project Resources

- [Semaphore Boilerplate](https://github.com/cedoor/semaphore-boilerplate)
- [Semaphore](https://github.com/appliedzkp/semaphore)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://docs.soliditylang.org/en/v0.8.13/)
- [Harmony Testnet Faucet](https://faucet.pops.one/)
