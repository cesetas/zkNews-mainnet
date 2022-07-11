import type { NextApiRequest, NextApiResponse } from "next";
import { getContract } from "../../../utils/contract";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { zkNewsContract, account } = await getContract();

    const identityCommitmentsBN = await zkNewsContract.methods
      .getIdentityCommitments()
      .call({ from: account, gas: 6721900 });

    res.status(200).send(identityCommitmentsBN);
  } catch (error: any) {
    res.status(500).send(error.reason || "Failed to get");
  }
}
