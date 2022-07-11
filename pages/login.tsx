import React from "react";
import { useState } from "react";
const { Strategy, ZkIdentity } = require("@zk-kit/identity");
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, providers } from "ethers";
import {
  Button,
  Container,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material/";
import Link from "next/link";
import abi from "../abi/zkNews.json";

const Login = () => {
  const [isLoging, setIsLoging] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [isStatusChanged, setIsStatusChanged] = React.useState(false);
  const [identityStatus, setIdentityStatus] = React.useState(false);

  const handleLogin = async () => {
    setIsLoging(true);
    if (!window.ethereum) {
      alert("Install metamask");
      setIsLoging(false);
      return;
    }

    const provider = (await detectEthereumProvider()) as any;
    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const senderAccount = await signer.getAddress();

    const message = await signer.signMessage(
      "Please sign the message to continue"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    // const { zkNewsContract, account } = await getContract();
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

    // checking previous identites off-chain
    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    if (isIdentityIncludedBefore) {
      setIsLoging(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("This account has already been registered before!");
      return;
    } else {
      const tx = await zkNewsContract.insertIdentityAsClient(
        ethers.BigNumber.from(identityCommitment),
        { from: senderAccount, gasLimit: 1000000 }
      );

      await tx.wait();

      setIsStatusChanged(true);
      setIdentityStatus(false);
      setStatus("Your account have been registered successfully");
    }

    setIsLoging(false);
  };

  return (
    <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
      <Box
        sx={{
          width: 600,
          height: "auto",
          backgroundColor: "light.gray",
        }}
      >
        {!isStatusChanged ? (
          <></>
        ) : (
          <>
            <Alert severity={identityStatus ? "error" : "success"}>
              {status}
            </Alert>
          </>
        )}

        <h1 className="text-8xl tracking-tight mb-4 font-extrabold text-blue-900 sm:text-3xl md:text-6xl">
          zKNews Registration
        </h1>
        <h2 className="mt-3 text-base mb-3	text-align: justify; text-yellow-500 sm:mt-5 sm:text-lg sm:max-w-3xl sm:mx-auto md:mt-5 md:text-3xl lg:mx-0">
          Do you want to publish news or to like and to fund the news ?
        </h2>
        <h2 className="mt-3 text-base mb-3	text-align: justify; text-yellow-500 sm:mt-5 sm:text-lg sm:max-w-3xl sm:mx-auto md:mt-5 md:text-3xl lg:mx-0">
          Become our journalist or subscriber
        </h2>

        {isLoging ? (
          <CircularProgress />
        ) : (
          <>
            <Button
              onClick={handleLogin}
              fullWidth
              variant="contained"
              sx={{
                p: 3,
                mt: 3,
                mb: 3,
                color: "white",
                fontSize: "40px",
                fontWeight: "bold",
              }}
            >
              Login
            </Button>
          </>
        )}
        {isStatusChanged ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Link href="/news">
                  <Button
                    variant="contained"
                    sx={{
                      p: 3,
                      mt: 3,
                      mb: 3,
                      color: "orange",
                      fontSize: "40px",
                    }}
                    size="small"
                  >
                    Explore news
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={6}>
                <Link href="/postnews">
                  <Button
                    variant="contained"
                    sx={{
                      p: 3,
                      mt: 3,
                      mb: 3,
                      color: "orange",
                      fontSize: "40px",
                    }}
                  >
                    Post news
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Container>
  );
};

export default Login;
