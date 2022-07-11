import Web3 from "web3";
import { AbiItem } from "web3-utils";
import abi from "../abi/zkNews.json";

const getContract = async () => {
  const PTE_KEY = process.env.NEXT_PUBLIC_MAIN_PRIVATE_KEY;
  const URL = process.env.NEXT_PUBLIC_MAIN_URL;
  const contractAddress = process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS;

  const web3 = new Web3(URL as string);
  web3.eth.handleRevert = true; // return custom error messages from contract

  let mainAccount = web3.eth.accounts.privateKeyToAccount(PTE_KEY as string);
  web3.eth.accounts.wallet.add(mainAccount);
  web3.eth.defaultAccount = mainAccount.address;

  const zkNewsContract = new web3.eth.Contract(
    abi.abi as AbiItem[],
    contractAddress
  );
  return { zkNewsContract, account: web3.eth.defaultAccount };
};

export { getContract };
