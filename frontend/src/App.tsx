import { useState, useEffect } from "react";
import { Textarea, Box, Heading, Input, Button, Link, Badge, Divider, Spinner, useToast, IconButton } from "@chakra-ui/react";
import { ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import axios, { AxiosError } from "axios";
import Dropzone from "./components/Dropzone";
import Hero from "./components/Hero";
// import GenerateProof from "./components/GenerateProof";
// import VerifyProof from "./components/VerifyProof";

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

  // Shorten ETH Address to be 0x7e4a3..F3fE5 instead of 0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5
  function shortenAddress(address: string): string {
    if (address.length < 10) {
      return address;
    }

    const prefix = address.slice(0, 7);
    const suffix = address.slice(-5);

    return `${prefix}..${suffix}`;
  }

  return (
    // White background (edges of website)
    <Box backgroundColor={"rgb(244, 249, 249)"} p="10px" overflow={"auto"}>
      {/*Fancy succinct themed container*/}
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
        // Fancy shadow at bottom of container
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
        {/*Diagional background lines*/}
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
          <Hero />
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
