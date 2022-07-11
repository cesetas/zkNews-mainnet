import React, { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
const { Strategy, ZkIdentity } = require("@zk-kit/identity");
import { ethers, providers, utils } from "ethers";
import Link from "next/link";
import {
  Button,
  Box,
  Container,
  TextField,
  createTheme,
  ThemeProvider,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import fetch from "isomorphic-unfetch";
import LoadingButton from "@mui/lab/LoadingButton";
import { buildMimc7 } from "circomlibjs";
import abi from "../abi/zkNews.json";

const theme = createTheme();

const initialvalues = {
  title: "",
  category: "",
  location: "",
  news: "",
  photoURL: "",
  likes: "0",
  dislikes: "0",
};

function PostNews() {
  const [values, setValues] = useState(initialvalues);
  const [commitment, setCommitment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

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

  const createPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const privateSalt = commitment;

    if (
      privateSalt === "" ||
      values.category === "" ||
      values.location === "" ||
      values.title === ""
    ) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("You should define required parts!");
      setIsSubmitting(false);
      return;
    }

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

    let currentIdentityCommitments: any = [];

    try {
      // const { zkNewsContract, account } = await getContract();
      const zkNewsContract = await new ethers.Contract(
        process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const transactionResponse = await zkNewsContract.getIdentityCommitments();

      for (var i = 0; i < transactionResponse.length; i++) {
        currentIdentityCommitments.push(transactionResponse[i].toString());
      }
    } catch (error: any) {
      console.log(error || "Failed to get");
      setIsSubmitting(false);
    }

    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsSubmitting(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("You should complete the registration process before posting.");
      return;
    } else {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_LOC}api/posts`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();
      const postId = data.data._id;

      const privateSalt = commitment;

      if (privateSalt === "") {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setStatus("You should define a private key!");
        setIsSubmitting(false);
        deletePost(postId);
        return;
      }

      const mimc7 = (await buildMimc7()) as any;

      const hashCommitment = buf2Bigint(
        mimc7.hash(privateSalt, identityCommitment)
      );

      try {
        const zkNewsContract = await new ethers.Contract(
          process.env.NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

        const tx = await zkNewsContract.postNews(
          utils.formatBytes32String(postId),
          hashCommitment,
          { from: senderAccount, gasLimit: 1000000 }
        );
        await tx.wait();

        setIsStatusChanged(true);
        setIdentityStatus(false);
        setStatus("Your post have been published successfully");
        setIsSubmitting(false);
        setCommitment("");
      } catch (error) {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setStatus("Your post have not been published!");
        setCommitment("");
        console.log(error);
        setIsSubmitting(false);
        deletePost(postId);
      }
    }
  };

  const handleChange = (event: any) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsSubmitting(true);
    createPost(event);
    setValues(initialvalues);
  };

  const [loading, setLoading] = useState(true);
  function handleClick() {
    setLoading(true);
  }

  const deletePost = async (_id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_LOC}api/posts/${_id}`, {
        method: "Delete",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
          <div>
            {" "}
            {!isStatusChanged ? (
              <></>
            ) : (
              <>
                <Alert severity={identityStatus ? "error" : "success"}>
                  {status}
                </Alert>
              </>
            )}{" "}
            {isSubmitting ? (
              <LoadingButton
                onClick={handleClick}
                endIcon={<SendIcon />}
                loading={loading}
                loadingPosition="end"
                variant="contained"
              >
                Publishing
              </LoadingButton>
            ) : (
              <>
                <h1 className="text-6xl text-align-center  tracking-tight mb-4 font-extrabold text-blue-900 sm:text-3xl md:text-5xl">
                  Post your news/articles
                </h1>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "400",
                    mt: 2,
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    fullWidth
                    required
                    id="title"
                    name="title"
                    label="Title"
                    variant="outlined"
                    sx={{
                      mt: 2,
                    }}
                    value={values.title}
                    onChange={handleChange}
                  />
                  <Select
                    variant="outlined"
                    labelId="category1"
                    name="category"
                    id="category"
                    value={values.category}
                    label="Category"
                    sx={{
                      mt: 2,
                    }}
                    onChange={handleChange}
                  >
                    <MenuItem value={"Politics"}>Politics</MenuItem>
                    <MenuItem value={"Business"}>Business</MenuItem>
                    <MenuItem value={"Sports"}>Sports</MenuItem>
                    <MenuItem value={"Life"}>Life</MenuItem>
                    <MenuItem value={"Culture"}>Culture</MenuItem>
                  </Select>
                  <FormHelperText>*Please select a category</FormHelperText>

                  <Select
                    variant="outlined"
                    labelId="location1"
                    id="location"
                    name="location"
                    value={values.location}
                    label="Location"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Africa"}>Africa</MenuItem>
                    <MenuItem value={"Asia"}>Asia</MenuItem>
                    <MenuItem value={"Australia"}>Australia</MenuItem>
                    <MenuItem value={"Europe"}>Europe</MenuItem>
                    <MenuItem value={"Latin America"}>Latin America</MenuItem>
                    <MenuItem value={"Middle East"}>Middle East</MenuItem>
                    <MenuItem value={"US&Canada"}>US&Canada</MenuItem>
                  </Select>

                  <FormHelperText>*Please select a location</FormHelperText>

                  <TextField
                    fullWidth
                    id="news"
                    name="news"
                    label="News"
                    multiline
                    rows={5}
                    sx={{
                      mt: 2,
                    }}
                    helperText="Share the news"
                    value={values.news}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    id="photoURL"
                    name="photoURL"
                    label="Photo URL"
                    sx={{
                      mt: 2,
                    }}
                    value={values.photoURL}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    required
                    type="password"
                    id="commitment"
                    name="commitment"
                    label="Ownership Commitment"
                    variant="outlined"
                    helperText="Please define your private key"
                    sx={{
                      mt: 2,
                    }}
                    value={commitment}
                    onChange={(e) => {
                      setCommitment(e.target.value);
                    }}
                  />
                  <Button
                    type="submit"
                    color="inherit"
                    fullWidth
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{
                      mt: 2,
                      mb: 3,
                      color: "blue",
                      backgroundColor: "yellow",
                    }}
                  >
                    Publish
                  </Button>

                  <Link href="/">
                    <Button color="inherit" variant="contained">
                      Back to homepage
                    </Button>
                  </Link>
                  {isStatusChanged ? (
                    <>
                      <Link href="/news">
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            mt: 3,
                            mb: 3,
                            color: "blue",
                            backgroundColor: "yellow",
                          }}
                        >
                          Explore the news
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <></>
                  )}
                </Box>
              </>
            )}
          </div>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default PostNews;
