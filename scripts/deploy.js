const hre = require("hardhat");

async function main() {
  // Semaphore verifier
  const VerifierContract = await hre.ethers.getContractFactory("Verifier");
  const verifier = await VerifierContract.deploy();

  await verifier.deployed();
  console.log("Semaphore verifier deployed to:", verifier.address);

  //Main contract
  const ZkNews = await hre.ethers.getContractFactory("zkNews");
  const zkNews = await ZkNews.deploy(verifier.address);

  await zkNews.deployed();

  console.log("zkNews deployed to:", zkNews.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
