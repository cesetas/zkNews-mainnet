import { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
const { generateMerkleProof, Semaphore } = require("@zk-kit/protocols");
import { ethers, providers, utils } from "ethers";
import abi from "../../abi/zkNews.json";
import fetch from "isomorphic-unfetch";
import { useRouter } from "next/router";
import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  Box,
  Container,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { buildMimc7 } from "circomlibjs";
import Link from "next/link";

export default function Post({ post }) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [salt, setSalt] = useState("");
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);

  const router = useRouter();
  const postId = post._id as string;

  useEffect(() => {
    fetch(`https://zknews.vercel.app/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...post, likes: likes }),
    });
  }, [likes]);

  useEffect(() => {
    fetch(`https://zknews.vercel.app/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...post, dislikes: dislikes }),
    });
  }, [dislikes]);

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

  const likePost = async () => {
    setIsLiking(true);

    const provider = (await detectEthereumProvider()) as any;

    if (!provider) {
      alert("MetaMask not found");
      setIsLiking(false);
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();
    const message = await signer.signMessage(
      "Please sign the message to continue"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    const zkNewsContract = await new ethers.Contract(
      process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
      abi.abi,
      signer
    );

    let identityCommitments: any = [];

    const transactionResponse = await zkNewsContract.getIdentityCommitments();

    for (var i = 0; i < transactionResponse.length; i++) {
      identityCommitments.push(transactionResponse[i].toString());
    }

    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Please try to like after registration.");
      setIsLiking(false);
      return;
    } else {
      const identityCommitmentsSemaphore = [
        BigInt(1),
        identityCommitment,
        BigInt(2),
      ];

      const merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        identityCommitmentsSemaphore,
        identityCommitment
      );

      const signal = "newLike";

      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        merkleProof.root,
        signal
      );

      const { proof, publicSignals } = await Semaphore.genProof(
        witness,
        "../semaphore.wasm",
        "../semaphore_final.zkey"
      );

      const solidityProof = await Semaphore.packToSolidityProof(proof);

      try {
        const tx1 = await zkNewsContract.likePost(
          utils.formatBytes32String(postId),
          utils.formatBytes32String(signal),
          merkleProof.root,
          publicSignals.nullifierHash,
          publicSignals.externalNullifier,
          solidityProof,
          { from: senderAccount, gasLimit: 1000000 }
        );
        await tx1.wait();
      } catch (error) {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setIsLiking(false);
        setStatus("You can not like or dislike more than one!");
        console.log(error);
        return;
      }

      try {
        let numLikes = await zkNewsContract.getPostLikes(
          utils.formatBytes32String(postId)
        );
        const newLikes = numLikes.toString();
        setLikes(newLikes);
      } catch (error) {
        setIsLiking(false);
        console.log(error);
      }
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setIsLiking(false);
      setStatus("Post has been liked successfully");
    }
  };

  const dislikePost = async () => {
    setIsDisliking(true);

    const provider = (await detectEthereumProvider()) as any;

    if (!provider) {
      alert("MetaMask not found");
      setIsDisliking(false);
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();
    const message = await signer.signMessage(
      "Please sign the message to continue"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    const zkNewsContract = await new ethers.Contract(
      process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
      abi.abi,
      signer
    );

    let identityCommitments: any = [];

    const transactionResponse = await zkNewsContract.getIdentityCommitments();

    for (var i = 0; i < transactionResponse.length; i++) {
      identityCommitments.push(transactionResponse[i].toString());
    }

    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Please try to dislike after registration.");
      setIsDisliking(false);
      return;
    } else {
      const identityCommitmentsSemaphore = [
        BigInt(1),
        identityCommitment,
        BigInt(2),
      ];
      const merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        identityCommitmentsSemaphore,
        identityCommitment
      );
      const signal = "newDislike";

      const witness = Semaphore.genWitness(
        identity.getTrapdoor(),
        identity.getNullifier(),
        merkleProof,
        merkleProof.root,
        signal
      );

      const { proof, publicSignals } = await Semaphore.genProof(
        witness,
        "../semaphore.wasm",
        "../semaphore_final.zkey"
      );

      const solidityProof = Semaphore.packToSolidityProof(proof);

      try {
        const tx2 = await zkNewsContract.dislikePost(
          utils.formatBytes32String(postId),
          utils.formatBytes32String(signal),
          merkleProof.root,
          publicSignals.nullifierHash,
          publicSignals.externalNullifier,
          solidityProof,
          { from: senderAccount, gasLimit: 1000000 }
        );
        await tx2.wait();
      } catch (error) {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setIsDisliking(false);
        setStatus("You can not dislike or like more than one!");
        console.log(error);
        return;
      }

      try {
        let numDislikes = await zkNewsContract.getPostDislikes(
          utils.formatBytes32String(postId)
        );
        const newDislikes = numDislikes.toString();

        setDislikes(newDislikes);
      } catch (error) {
        setIsDisliking(false);
        console.log(error);
      }
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setIsDisliking(false);
      setStatus("Post has been disliked successfully");
    }
  };

  const fundPost = async () => {
    setIsFunding(true);

    if (fundAmount === "") {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("You should define required parts!");
      setIsFunding(false);
      return;
    }

    const amount = fundAmount;

    const provider = (await detectEthereumProvider()) as any;
    if (!provider) {
      alert("MetaMask not found");
      setIsFunding(false);
      return;
    }

    alert(`You are funding ${amount} MATIC`);

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();

    const zkNewsContract = await new ethers.Contract(
      process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
      abi.abi,
      signer
    );

    try {
      const txfund = await zkNewsContract.fundPost(
        utils.formatBytes32String(postId),
        {
          from: senderAccount,
          gasLimit: 1000000,
          value: ethers.utils.parseUnits(amount, "ether"),
        }
      );
      await txfund.wait();
    } catch (error) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setIsFunding(false);
      setStatus("Post has not funded!");
      setFundAmount("");
      console.log(error);
      return;
    }

    setIsStatusChanged(true);
    setIdentityStatus(false);
    setIsFunding(false);
    setStatus("Post has been funded successfully");
    setFundAmount("");
  };

  const withdraw = async () => {
    setIsWithdrawing(true);

    if (withdrawAmount === "" || salt === "") {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("You should define required parts!");
      setIsWithdrawing(false);
      return;
    }

    alert(
      "Only post owners are allowed to withdraw funds. If you are the owner of this post please keep going"
    );

    const amount = String(parseFloat(withdrawAmount) * 10e17);

    const provider = (await detectEthereumProvider()) as any;
    if (!provider) {
      alert("MetaMask not found");
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();
    const message = await signer.signMessage(
      "Please sign the message to continue"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    const privateSalt = salt;

    try {
      const mimc7 = (await buildMimc7()) as any;

      const hashCommitment = buf2Bigint(
        mimc7.hash(privateSalt, identityCommitment)
      );

      const zkNewsContract = await new ethers.Contract(
        process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const tx3 = await zkNewsContract.withdrawFunds(
        utils.formatBytes32String(postId),
        amount,
        hashCommitment,
        {
          from: senderAccount,
          gasLimit: 1000000,
          gasPrice: 40000000000,
        }
      );
      await tx3.wait();
    } catch (error) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setIsWithdrawing(false);
      setStatus("You can not withdraw!");
      setWithdrawAmount("");
      setSalt("");
      console.log(error);
      return;
    }

    setIsStatusChanged(true);
    setIdentityStatus(false);
    setStatus(`${withdrawAmount} MATIC has been withdrawn succesfully`);
    setIsWithdrawing(false);
    setWithdrawAmount("");
    setSalt("");
  };

  const funds = async () => {
    const provider = (await detectEthereumProvider()) as any;
    if (!provider) {
      alert("MetaMask not found");
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();

    try {
      const zkNewsContract = await new ethers.Contract(
        process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const tx = await zkNewsContract.getPostFunds(
        utils.formatBytes32String(postId)
      );
      const ethValue = await ethers.utils.formatEther(tx);

      setStatus(`This Post has ${ethValue} MATIC`);
    } catch (error) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Funds not found");
      console.log(error);
      return;
    }

    setIsStatusChanged(true);
    setIdentityStatus(false);
  };

  //This function is just for development. After deploymnet to mainnet it will be deleted
  // const deletePost = async () => {
  //   try {
  //     await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_LOC}api/posts/${postId}`, {
  //       method: "Delete",
  //     });

  //     router.push("/news");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleLike = async (event: any) => {
    event.preventDefault();
    setIsLiking(true);
    likePost();
  };

  const handleDislike = async (event: any) => {
    event.preventDefault();
    setIsDisliking(true);
    dislikePost();
  };

  const handleFund = async (event: any) => {
    event.preventDefault();
    setIsFunding(true);
    fundPost();
  };

  const handleWithdraw = async (event: any) => {
    event.preventDefault();
    setIsWithdrawing(true);
    withdraw();
  };

  const getFunds = async (event: any) => {
    event.preventDefault();
    funds();
  };

  // const handleDelete = async (event: any) => {
  //   event.preventDefault();
  //   deletePost();
  // };

  return (
    <div>
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Box
          sx={{
            width: 700,
            height: "auto",
            backgroundColor: "light.gray",
          }}
        >
          <Paper
            sx={{
              p: 2,
              pl: 4,
              pr: 4,
              mt: 1,
            }}
          >
            <h1 className="tracking-tight mb-4 font-extrabold text-gray-700 sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl">
              {post.title}
            </h1>
          </Paper>
          <Paper
            sx={{
              p: 2,
              pl: 4,
              pr: 4,
              mt: 1,
            }}
          >
            <img src={post.photoURL} alt={post.location} />
          </Paper>
          <Paper
            sx={{
              p: 2,
              pl: 4,
              pr: 4,
              mt: 1,
            }}
          >
            <h2 className="mt-3 text-base 	text-align: justify; text-gray-500 sm:mt-5 sm:text-lg sm:max-w-3xl sm:mx-auto md:mt-5 md:text-3xl lg:mx-0">
              {post.news}
            </h2>
          </Paper>
          {isLiking ? (
            <CircularProgress />
          ) : (
            <Button
              onClick={handleLike}
              fullWidth
              size="large"
              sx={{
                mt: 3,
                mb: 3,
                color: "white",
                backgroundColor: "blue",
              }}
              variant="contained"
            >
              <span>Like {likes}</span>
            </Button>
          )}

          {isDisliking ? (
            <CircularProgress />
          ) : (
            <Button
              onClick={handleDislike}
              fullWidth
              size="large"
              color="error"
              sx={{
                mb: 3,
              }}
              variant="contained"
            >
              Dislike {dislikes}
            </Button>
          )}

          {/* <Button onClick={handleDelete} size="small">
            delete
          </Button> */}
        </Box>
        {!isStatusChanged ? (
          <></>
        ) : (
          <>
            <Paper
              sx={{
                p: 1,
                pl: 4,
                pr: 4,
                mt: 1,
                width: "127%",
              }}
            >
              <Alert severity={identityStatus ? "error" : "success"}>
                {status}
              </Alert>
            </Paper>
          </>
        )}

        <Paper
          sx={{
            p: 2,
            pl: 4,
            pr: 4,
            mt: 1,
            width: "127%",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  component="form"
                  onSubmit={handleFund}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "200",
                    mt: 2,
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    fullWidth
                    required
                    type="number"
                    id="fund"
                    label="Fund Amount (MATIC)"
                    helperText="Specify the amount as matic"
                    value={fundAmount}
                    onChange={(e) => {
                      setFundAmount(e.target.value);
                    }}
                  />
                  {isFunding ? (
                    <CircularProgress />
                  ) : (
                    <Button
                      type="submit"
                      color="inherit"
                      fullWidth
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{
                        mt: 3,
                        mb: 3,
                        color: "white",
                        backgroundColor: "blue",
                      }}
                    >
                      Fund
                    </Button>
                  )}
                </Box>
                <Button
                  color="inherit"
                  fullWidth
                  variant="contained"
                  onClick={getFunds}
                  sx={{
                    mb: 3,
                    color: "white",
                    backgroundColor: "blue",
                  }}
                >
                  Current Funds
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Box
                  component="form"
                  onSubmit={handleWithdraw}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "200",
                    mt: 2,
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    fullWidth
                    required
                    type="number"
                    id="withdraw"
                    label="Withdraw Amount (MATIC)"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    type="number"
                    id="salt"
                    label="Your Password"
                    helperText="Specify the password to withdraw"
                    sx={{
                      mt: 3,
                      color: "blue",
                    }}
                    value={salt}
                    onChange={(e) => {
                      setSalt(e.target.value);
                    }}
                  />
                  {isWithdrawing ? (
                    <CircularProgress />
                  ) : (
                    <Button
                      type="submit"
                      size="large"
                      color="error"
                      fullWidth
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{
                        mt: 3,
                        mb: 3,
                      }}
                    >
                      Withdraw Funds
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        <Link href="/postnews">
          <Button
            fullWidth
            sx={{
              mt: 3,
              mb: 3,
              color: "white",
              backgroundColor: "blue",
            }}
            variant="contained"
          >
            Post news
          </Button>
        </Link>
        <Link href="/">
          <Button
            fullWidth
            sx={{
              mb: 3,
              color: "white",
              backgroundColor: "blue",
            }}
            variant="contained"
          >
            Back to Home
          </Button>
        </Link>
      </Container>
    </div>
  );
}

Post.getInitialProps = async ({ query: { _id } }) => {
  const res = await fetch(`https://zknews.vercel.app/api/posts/${_id}`);
  const { data } = await res.json();

  return { post: data };
};
