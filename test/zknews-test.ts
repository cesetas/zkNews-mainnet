import { Strategy, ZkIdentity } from "@zk-kit/identity";
import {
  generateMerkleProof,
  genExternalNullifier,
  Semaphore,
  StrBigInt,
} from "@zk-kit/protocols";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers, run } from "hardhat";
import { buildMimc7 } from "circomlibjs";

describe("zkNews", function () {
  let contract: Contract;

  const DEPTH = 20;
  const ZERO_VALUE = BigInt(0);
  const WASM_FILEPATH = "./public/semaphore.wasm";
  const FINAL_ZKEY_FILEPATH = "./public/semaphore_final.zkey";
  const IDENTITY_MESSAGE = "Please sign the message to continue";
  const postIds = [BigInt(1), BigInt(2)];

  // Test accounts
  let signers: Signer[];
  let alice: Signer;
  let bob: Signer;

  let identity1: ZkIdentity;
  let identity2: ZkIdentity;
  let identityCommitment1: bigint;
  let identityCommitment2: bigint;
  let identityCommitments1: StrBigInt[] = [];
  let identityCommitments2: StrBigInt[] = [];
  let signals = ["like", "dislike"]; // user may only "like" or "dislike" a post, not both
  let bytes32SignalLike: string;
  let bytes32SignalDislike: string;
  let postId: string;

  type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

  const buf2Bigint = (buf: ArrayBuffer | TypedArray | Buffer): bigint => {
    let bits = 8n;
    if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
    else buf = new Uint8Array(buf);

    let ret = 0n;
    for (const i of (buf as TypedArray | Buffer).values()) {
      const bi = BigInt(i);
      ret = (ret << bits) + bi;
    }
    return ret;
  };

  before(async () => {
    contract = await run("deploy", { logs: false });
    signers = await ethers.getSigners();
    alice = signers[0];
    bob = signers[1];

    // create  identity commitment for Alice
    const message1 = await alice.signMessage(IDENTITY_MESSAGE);
    identity1 = new ZkIdentity(Strategy.MESSAGE, message1);
    identityCommitment1 = identity1.genIdentityCommitment();
    identityCommitments1 = [BigInt(1), identityCommitment1, BigInt(2)];

    // create  identity commitment for Bob
    const message2 = await bob.signMessage(IDENTITY_MESSAGE);
    identity2 = new ZkIdentity(Strategy.MESSAGE, message2);
    identityCommitment2 = identity2.genIdentityCommitment();
    identityCommitments2 = [BigInt(1), identityCommitment2, BigInt(2)];

    bytes32SignalLike = ethers.utils.formatBytes32String(signals[0]);
    bytes32SignalDislike = ethers.utils.formatBytes32String(signals[1]);

    postId = ethers.utils.formatBytes32String("123");
  });

  it("Should Alice register", async () => {
    // Add identity commitment of Alice
    const transaction = contract.insertIdentityAsClient(
      ethers.BigNumber.from(identityCommitment1)
    );
    await expect(transaction)
      .to.emit(contract, "IdentityCommitment")
      .withArgs(ethers.BigNumber.from(identityCommitment1));
  });

  it("Should Bop register", async () => {
    // Add identity commitment of Alice
    const transaction = contract.insertIdentityAsClient(
      ethers.BigNumber.from(identityCommitment2)
    );
    await expect(transaction)
      .to.emit(contract, "IdentityCommitment")
      .withArgs(ethers.BigNumber.from(identityCommitment2));
  });

  it("Should Allice post a news", async () => {
    const privateSalt = "1234";

    const mimc7 = await buildMimc7();

    const hashCommitment = buf2Bigint(
      mimc7.hash(privateSalt, identityCommitment1)
    );
    console.log("hashcommitment hazır");

    const transaction = contract.postNews(postId, hashCommitment);
    await expect(transaction).to.emit(contract, "NewPost").withArgs(postId);
  });

  it("Should Bop like the post", async () => {
    const merkleProof = generateMerkleProof(
      DEPTH,
      ZERO_VALUE,
      identityCommitments2,
      identityCommitment2
    );

    const witness = Semaphore.genWitness(
      identity2.getTrapdoor(),
      identity2.getNullifier(),
      merkleProof,
      merkleProof.root,
      signals[0]
    );

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      WASM_FILEPATH,
      FINAL_ZKEY_FILEPATH
    );

    const solidityProof = Semaphore.packToSolidityProof(proof);

    const transaction = contract.likePost(
      postId,
      bytes32SignalLike,
      merkleProof.root,
      publicSignals.nullifierHash,
      publicSignals.externalNullifier,
      solidityProof
    );
    await expect(transaction)
      .to.emit(contract, "PostLiked")
      .withArgs(postId, 1); // 1 vote
  });

  it("Should Bop fund the post", async () => {
    const transaction = contract.fundPost(postId, {
      value: ethers.utils.parseEther("5"),
    });
    await expect(transaction).to.emit(contract, "Funded").withArgs(postId);
  });

  it("Should Alice withdraw", async () => {
    const amount = "1";

    const privateSalt = "1234";
    const mimc7 = await buildMimc7();

    const hashCommitment = buf2Bigint(
      mimc7.hash(privateSalt, identityCommitment1)
    );
    const transaction = contract.withdrawFunds(
      postId,
      ethers.utils.parseEther(amount),
      hashCommitment
    );
    await expect(transaction)
      .to.emit(contract, "Withdrawal")
      .withArgs(postId, ethers.utils.parseEther(amount));
  });
});
