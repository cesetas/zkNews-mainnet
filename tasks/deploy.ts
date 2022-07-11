import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy", "Deploy zkNews contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
    const VerifierContract = await ethers.getContractFactory("Verifier");
    const verifier = await VerifierContract.deploy();

    await verifier.deployed();

    logs &&
      console.log(
        `Verifier contract has been deployed to: ${verifier.address}`
      );

    const ZkNewsContract = await ethers.getContractFactory("zkNews");

    const zkNewsContract = await ZkNewsContract.deploy(verifier.address);

    await zkNewsContract.deployed();

    logs &&
      console.log(
        `zkNews contract has been deployed to: ${zkNewsContract.address}`
      );

    return zkNewsContract;
  });
