# Final Project : zkNews

This project on which news and articles are published by its registered members, aims at giving users confidence to submit and to follow the news as anonymously by help of Semaphore and ZKP in order to serve freedom of speech within a secure platform. There is also a reward mechanism which supports the survival of the system. And all users are able to encourage members publisihing on the system to do their job better.

- [Demo video](https://youtu.be/kfH1XNY4EN8)
- [Testnet site](https://zknews-testnet.vercel.app/)
- [Mainnet site](https://zknews.vercel.app/)

---

# How It Works

- The frontend built with Next.js and the Contracts was deployed on Polygon blockchain.

- Only registered users can publish, like, dislike, and fund the posts.

## Registration

- Users first should go to registration part to create their private identity by tools provided by zk-kit [library](https://github.com/privacy-scaling-explorations/zk-kit). This will provide users anonomity while publishing, liking/disliking, funding, and withrawing from the dApp.

- Personally identifiable data is not stored on the backend servers or the blockchain and each user has their private identity commitment stored on-chain.

- After registration and getting private identity commitment now user can post, like/dislike, and fund any news.

## Post news

- During posting user should fill all the necessary blanks. Especially user should specifiy a secreet number as password in the ownership commitment blank.
  <img src="/utils/screenshots/ownershipcommitment.png" width="800px" height="auto"/>

- With private identity created at the registration and secret number (ownership commitment) a hash commitment will be created (with mimc hash) and will be kept in smart contract.

- Users only can withdraw funds from their post with this secret number and their private identiy created at registration part.

## Like/Dislike the posts

- Like and dislike numbers are very important for a post. It is not only encouraging diseminating the real news but also enabling to fund a given post. Like numbers shlould be equal or more than dislike numbers to fund the post.

- Likes and dislikes numbers are recorded at smart contract

- Semaphore will provide users only like or dislike one post once with their private identity as like/dislike numbers effect funding condition of the post.

## Fund the posts

- If like numbers are equal or more than dislike numbers one can fund any post. Any amount can be funded.
- Funds are kept by smart contract.

## Funds withdrawal

- Only the users with private identity commitment created that post and secret hash commitment defined during publishing the post can withraw the from post balance.

---

# How to Build the Project

- Clone the repository.
- After, to install all necessary packages run;

```
yarn
```

- to start a local node;

```
yarn dev
```

<img src="/utils/screenshots/mainpage.png" width="800px" height="auto"/>

- to test;

```
yarn test
```

- to deploy the smart contracts to the local node first create a .env.local file and put neccessary inputs.

- To setup database (mongoDB); Copy your url from mongoDB and paste it to .env.local file as;

```
CONNECTION_URL =
```

- Load your project in any UI provider. This project was loaded to vercel.com. To setup UI domain name; write your UI domain name preference into the .env.local file as shown;

```
NEXT_PUBLIC_DOMAIN_LOC = https://zknews-testnet.vercel.app/
```

- To deploy the contract on testnet;

```
yarn hardhat run scripts/deploy.js --network testnet
```

- Copy and write the deployed contract address to .env.local file.

- Import a few of the test accounts into Metamask for testing purposes.

---

# Project Resources

- [zk-kit](https://github.com/privacy-scaling-explorations/zk-kit)
- [Semaphore Boilerplate](https://github.com/cedoor/semaphore-boilerplate)
- [Semaphore](https://github.com/appliedzkp/semaphore)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://docs.soliditylang.org/en/v0.8.13/)
- [Polygon Testnet Faucet](https://faucet.polygon.technology/)
