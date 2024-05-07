import { useState, useEffect } from "react";
import { Textarea, Box, Heading, Text, Highlight, Input, Button, List, ListItem, Link, Badge, Divider, Spinner, useToast, IconButton } from "@chakra-ui/react";
import { ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import axios, { AxiosError } from "axios";
import Dropzone from "./components/Dropzone";

function App() {
  const [email, setEmail] = useState<string>(localStorage.getItem("email") || "");
  const [proof, setProof] = useState<Blob>();
  const [ethAddress, setEthAddress] = useState<string>(localStorage.getItem("ethAddress") || "");
  const [proofGenerating, setProofGenerating] = useState<boolean>(false);
  const [proofVerifying, setProofVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult>();
  const [proofFileName, setProofFileName] = useState("");
  const toast = useToast();

  type VerificationResult = {
    twitterHandle: string;
    ethAddress: string;
    proofValid: boolean;
  };

  useEffect(() => {
    localStorage.setItem("email", email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem("ethAddress", ethAddress);
  }, [ethAddress]);

  async function handleGenerateProof() {
    // Validate inputs
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!ethAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Ethereum address",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // timeout: 10 mins
    setProofGenerating(true);

    let response;
    const startTime = new Date().getTime();

    try {
      response = await axios.post(
        "http://127.0.0.1:8000/prove",
        { email, ethAddress },
        {
          timeout: 600000,
          responseType: "blob", // Set the response type to 'blob' (binary data)
        }
      );
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);

      // Create a Blob from the response data
      const proofBlob = new Blob([response.data], { type: "application/json" });
      setProofFileName("proof-with-io.json");
      setProof(proofBlob);
      setVerificationResult(undefined);
      toast({
        title: "Proof Generated",
        description: `Proof Of Twitter Created (${minutes}m${seconds}s)`,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        let message = error.message;

        if (axios.isAxiosError(error)) {
          // Handle Axios-specific errors
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.log(error);
            message = await error.response?.data.text();
          }
        }

        toast({
          title: "Error Generating Proof",
          description: message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }

    setProofGenerating(false);
  }

  function handleDownloadProof() {
    if (!proof) {
      toast({
        title: "Error",
        description: "Please generate a proof first",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Create a Blob from the proof string
    const proofBlob = new Blob([proof], { type: "application/json" });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(proofBlob);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;
    link.download = proofFileName;

    // Append the link to the document body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the temporary URL and remove the link from the document body
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }

  function handleFileAccepted(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        const blob = new Blob([reader.result], { type: file.type });
        setProofFileName(file.name);
        setProof(blob);
        setVerificationResult(undefined);
      } else {
        console.error("Failed to read the file as ArrayBuffer.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleVerifyProof() {
    if (!proof) {
      toast({
        title: "Error",
        description: "Please generate or upload a proof first",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setProofVerifying(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/verify", proof, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
      const result: VerificationResult = response.data;
      setVerificationResult(result);

      if (result.proofValid) {
        toast({
          title: "Proof Verified",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Proof Invalid",
          description: `Proof failed verification`,
          status: "warning",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (e) {
      let message = "Unknown Error";
      if (e instanceof Error) {
        message = e.message;
      }
      toast({
        title: "Error Verifying Proof",
        description: message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    setProofVerifying(false);
  }

  function shortenAddress(address: string): string {
    if (address.length < 10) {
      return address;
    }

    const prefix = address.slice(0, 7);
    const suffix = address.slice(-5);

    return `${prefix}..${suffix}`;
  }

  return (
    <Box backgroundColor={"rgb(244, 249, 249)"} p="10px" overflow={"auto"}>
      <Box
        width={"100%"}
        borderRadius={"20px"}
        backgroundColor={"rgb(101,131,143)"}
        height={"100%"}
        p={"20px"}
        margin={"auto"}
        minH={`max(900px, calc(100vh - 20px))`} // 900px (for smaller screens) or height of viewport
        display={"flex"}
        flexDirection={"column"}
        gap={"15px"}
        position="relative"
        overflow="hidden"
        _after={{
          content: '""',
          position: "absolute",
          bottom: "-10%",
          left: "-25%",
          width: "150%",
          height: "70%",
          background: "radial-gradient(ellipse at bottom center, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%)",
          zIndex: 1,
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={0}
          backgroundImage={`repeating-linear-gradient(
        -80deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px,
        transparent 50px
      )`}
        />
        <Heading fontWeight={"500"} marginX={"auto"} zIndex={2}>
          Proof Of Twitter: SP1 ZK Email Demo
        </Heading>

        <Box width={"100%"} maxW={"1200px"} zIndex={2} flexDirection={"column"} marginX={"auto"} display="flex" flexGrow={1}>
          <Divider />
          <Box flexGrow={1} alignItems="center" display={"flex"} gap={"40px"} flexDirection={"row"}>
            <Box width={"30%"}>
              <Heading fontWeight={"300"} fontSize={"20px"}>
                Prove you own a Twitter handle by verifying a confirmation email from Twitter.
              </Heading>
              <br />
              <Heading fontWeight={"300"} fontSize={"17px"}>
                Proofs generated using this website are a cryptographic guarantee that a user owns a certain Twitter account, while masking out any private
                data.
                <br />
                <br /> This demo is just one use case of Succinct's open-source zkVM, which lets developers write zero-knowledge proofs in Rust with unbeatable
                performance.
              </Heading>
            </Box>
            <Box width="70%">
              <List spacing={"7px"}>
                <ListItem display={"flex"} gap={"7px"}>
                  <Box
                    fontFamily={"IBM Plex Mono"}
                    fontWeight={"bold"}
                    paddingLeft={"15px"}
                    paddingRight={"15px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor={"white"}
                    opacity={"0.6"}
                    color={"black"}
                    borderRadius={"md"}
                  >
                    <Text textAlign={"center"}>1</Text>
                  </Box>
                  <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
                    Send yourself a{" "}
                    <Link href={"https://twitter.com/account/begin_password_reset"} isExternal>
                      {" "}
                      password reset email
                      <ExternalLinkIcon mx="2px" />
                    </Link>{" "}
                    from Twitter. (Twitter names with emoji might fail to pass DKIM verification)
                  </Box>
                </ListItem>
                <ListItem display={"flex"} gap={"7px"}>
                  <Box
                    fontFamily={"IBM Plex Mono"}
                    fontWeight={"bold"}
                    paddingLeft={"15px"}
                    paddingRight={"15px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor={"white"}
                    opacity={"0.6"}
                    color={"black"}
                    borderRadius={"md"}
                  >
                    <Text textAlign={"center"}>2</Text>
                  </Box>
                  <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
                    In your inbox, find the email from Twitter and click the three dot menu, then "Show original" then "Copy to clipboard". If on Outlook,
                    download the original email as .eml and copy it instead.
                  </Box>
                </ListItem>
                <ListItem display={"flex"} gap={"7px"}>
                  <Box
                    fontFamily={"IBM Plex Mono"}
                    fontWeight={"bold"}
                    paddingLeft={"15px"}
                    paddingRight={"15px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor={"white"}
                    opacity={"0.6"}
                    color={"black"}
                    borderRadius={"md"}
                  >
                    <Text textAlign={"center"}>3</Text>
                  </Box>
                  <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
                    Copy paste or drop that into the box below. Note that we cannot use this to phish you: we do not know your password.
                  </Box>
                </ListItem>
                <ListItem display={"flex"} gap={"7px"}>
                  <Box
                    fontFamily={"IBM Plex Mono"}
                    fontWeight={"bold"}
                    paddingLeft={"15px"}
                    paddingRight={"15px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor={"white"}
                    opacity={"0.6"}
                    color={"black"}
                    borderRadius={"md"}
                  >
                    <Text textAlign={"center"}>4</Text>
                  </Box>
                  <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
                    Paste in your sending Ethereum address. This associates your twitter handle with an ethereum address and ensures that no one else can
                    "steal" your proof for another account
                  </Box>
                </ListItem>
                <ListItem minH={"60px"} display={"flex"} gap={"7px"}>
                  <Box
                    fontFamily={"IBM Plex Mono"}
                    fontWeight={"bold"}
                    paddingLeft={"15px"}
                    paddingRight={"15px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor={"white"}
                    opacity={"0.6"}
                    color={"black"}
                    borderRadius={"md"}
                  >
                    <Text textAlign={"center"}>5</Text>
                  </Box>
                  <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
                    Click&nbsp;<b>"Generate Proof"</b> (will take ~4 minutes). Share this to privately prove your Twitter handle ownership!
                  </Box>
                </ListItem>
              </List>
            </Box>
          </Box>
          <Box display={"flex"} flexDirection={"column"} gap={"20px"} mb={"20px"} zIndex={2}>
            <Divider />
            <Box display={"flex"} flexDirection={"row"} gap={"40px"}>
              <Box display={"flex"} gap="10px" flexDirection={"column"} width={"100%"}>
                <Heading fontWeight={"400"} size={"lg"}>
                  Generate Proof
                </Heading>
                <Heading fontWeight={"400"} size={"sm"}>
                  Enter your raw email
                </Heading>
                <Textarea
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  size="md"
                  minH="200px"
                  placeholder="Full Email with Headers"
                  background="rgb(244, 249, 249)"
                />
                <Heading fontWeight={"400"} size={"sm"}>
                  Ethereum address to associate with twitter handle
                </Heading>
                <Box display={"flex"} flexDirection={"row"} gap={"10px"}>
                  <Input
                    background="rgb(244, 249, 249)"
                    value={ethAddress}
                    placeholder={"Ethereum Address (0x...)"}
                    onChange={(e) => setEthAddress(e.target.value)}
                    width={"100%"}
                  ></Input>
                  <Button
                    backgroundColor={"rgb(232, 254, 86)"}
                    isDisabled={proofGenerating}
                    color={"rgb(5, 14, 22)"}
                    width={"40%"}
                    minW="220px"
                    onClick={handleGenerateProof}
                  >
                    {proofGenerating ? "GENERATING PROOF" : "GENERATE PROOF"}&nbsp;{proofGenerating && <Spinner size={"xs"} />}
                  </Button>
                </Box>
              </Box>
              <Box display={"flex"} gap="10px" flexDirection={"column"} width={"100%"}>
                <Heading fontWeight={"400"} size={"lg"}>
                  Verify Proof
                </Heading>
                <Heading fontWeight={"400"} size={"sm"}>
                  Verify a twitter proof
                </Heading>
                {/*<Textarea*/}
                {/*    onChange={e => setProof(e.target.value)}*/}
                {/*    value={proof}*/}
                {/*    size="md"*/}
                {/*    minH="200px"*/}
                {/*    placeholder='Twitter Proof'*/}
                {/*    background='rgb(244, 249, 249)'*/}
                {/*    mb={"30px"}*/}
                {/*/>*/}
                <Dropzone onFileAccepted={handleFileAccepted} proofFileName={proofFileName} />

                <Box display={"flex"} flexDirection={"row"}>
                  {verificationResult !== undefined && (
                    <Box>
                      <Badge colorScheme={verificationResult?.proofValid ? "green" : "red"} variant={"outline"} position={"absolute"} mt="-20px">
                        {verificationResult?.proofValid ? "VERIFIED" : "NOT VERIFIED - PROOF INVALID"}
                      </Badge>
                      <Heading fontWeight={"500"} fontFamily={"IBM Plex Mono"} size="sm" alignContent={"center"}>
                        <Link href={`https://x.com/${verificationResult?.twitterHandle}`} isExternal>
                          {verificationResult?.twitterHandle}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </Heading>
                      <Heading fontWeight={"500"} fontFamily={"IBM Plex Mono"} size="sm" alignContent={"center"}>
                        <Link href={`https://etherscan.io/address/${verificationResult?.ethAddress}`} isExternal>
                          {shortenAddress(verificationResult?.ethAddress!)}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </Heading>
                    </Box>
                  )}

                  <Button
                    backgroundColor={"rgb(232, 254, 86)"}
                    color={"rgb(5, 14, 22)"}
                    onClick={handleVerifyProof}
                    minW={"220px"}
                    width={"40%"}
                    isDisabled={proofVerifying}
                    marginLeft={"auto"}
                  >
                    {proofVerifying ? "VERIFYING PROOF" : "VERIFY PROOF"}&nbsp;{proofVerifying && <Spinner size={"xs"} />}
                  </Button>
                  <IconButton
                    backgroundColor={"rgb(232, 254, 86)"}
                    color={"rgb(5, 14, 22)"}
                    onClick={handleDownloadProof}
                    marginLeft={"10px"}
                    aria-label="download proof"
                    icon={<DownloadIcon />}
                  >
                    DOWNLOAD PROOF
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
