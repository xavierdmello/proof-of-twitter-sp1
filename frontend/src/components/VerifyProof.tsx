import { useState } from "react";
import { Box, Heading, Button, Link, Badge, Spinner, useToast, IconButton } from "@chakra-ui/react";
import { ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import Dropzone from "./Dropzone";

interface VerifyProofProps {
  proof: Blob | undefined;
  onFileAccepted: (file: File) => void;
  onVerifyProof: () => Promise<void>;
  onDownloadProof: () => void;
  proofFileName: string;
  verificationResult: VerificationResult | undefined;
}

type VerificationResult = {
  twitterHandle: string;
  ethAddress: string;
  proofValid: boolean;
};

export default function VerifyProof({ proof, onFileAccepted, onVerifyProof, onDownloadProof, proofFileName, verificationResult }: VerifyProofProps) {
  const [proofVerifying, setProofVerifying] = useState<boolean>(false);
  const toast = useToast();

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
    await onVerifyProof();
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
    <Box display={"flex"} gap="10px" flexDirection={"column"} width={"100%"}>
      <Heading fontWeight={"400"} size={"lg"}>
        Verify Proof
      </Heading>
      <Heading fontWeight={"400"} size={"sm"}>
        Verify a twitter proof
      </Heading>
      <Dropzone onFileAccepted={onFileAccepted} proofFileName={proofFileName} />

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
          onClick={onDownloadProof}
          marginLeft={"10px"}
          aria-label="download proof"
          icon={<DownloadIcon />}
        >
          DOWNLOAD PROOF
        </IconButton>
      </Box>
    </Box>
  );
}
