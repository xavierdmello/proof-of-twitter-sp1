import { useState, useEffect } from "react";
import { Box, Heading, Divider, useToast } from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import Hero from "./components/Hero";
import GenerateProof from "./components/GenerateProof";
import VerifyProof from "./components/VerifyProof";

function App() {
  const [email, setEmail] = useState<string>(localStorage.getItem("email") || ""); // Raw email in string format
  const [proof, setProof] = useState<Blob>(); // Binary data of proof
  const [ethAddress, setEthAddress] = useState<string>(localStorage.getItem("ethAddress") || "");
  const [proofGenerating, setProofGenerating] = useState<boolean>(false); // Used to animate button
  const [proofVerifying, setProofVerifying] = useState<boolean>(false); // Used to animate button
  const [verificationResult, setVerificationResult] = useState<VerificationResult>(); // Result of verification (pass/fail, twitter handle, etc.)
  const [proofFileName, setProofFileName] = useState(""); // Sets text in the upload proof dropbox to proof name if proof is uploaded
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

  // Call 'prove' on backend with inputs 'email' and 'ethAddress'
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

  // Download the proof binary, if it exists, to the user's computer
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

  // Handle file being dropped into proof upload dropbox
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

  // Call "verify" on backend with proof binary that was just generated or uploaded
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
              <GenerateProof
                email={email}
                ethAddress={ethAddress}
                onEmailChange={setEmail}
                onEthAddressChange={setEthAddress}
                onGenerateProof={handleGenerateProof}
              />
              <VerifyProof
                proof={proof}
                onFileAccepted={handleFileAccepted}
                onVerifyProof={handleVerifyProof}
                onDownloadProof={handleDownloadProof}
                proofFileName={proofFileName}
                verificationResult={verificationResult}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
