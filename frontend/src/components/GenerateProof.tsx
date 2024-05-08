import { useState } from "react";
import { Textarea, Box, Heading, Input, Button, useToast, Spinner, Select } from "@chakra-ui/react";

interface GenerateProofProps {
  email: string;
  ethAddress: string;
  onEmailChange: (email: string) => void;
  onEthAddressChange: (ethAddress: string) => void;
  onGenerateProof: () => Promise<void>;
}

export default function GenerateProof({ email, ethAddress, onEmailChange, onEthAddressChange, onGenerateProof }: GenerateProofProps) {
  const [proofGenerating, setProofGenerating] = useState<boolean>(false);
  const [selectedExample, setSelectedExample] = useState<string>("");
  const toast = useToast();

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

    setProofGenerating(true);
    await onGenerateProof();
    setProofGenerating(false);
  }

  return (
    <Box display={"flex"} gap="10px" flexDirection={"column"} width={"100%"}>
      <Heading fontWeight={"400"} size={"lg"}>
        Generate Proof
      </Heading>
      <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
        <Heading fontWeight={"400"} size={"sm"}>
          Enter your raw email
        </Heading>
        <Select
          placeholder="No Example Selected"
          value={selectedExample}
          onChange={(e) => setSelectedExample(e.target.value)}
          variant={"filled"}
          size={"xs"}
          width={"auto"}
        >
          <option value="Base Case">Base Case</option>
          <option value="Non-Twitter">Non-Twitter</option>
          <option value="Invalid Signature">Invalid Signature</option>
          <option value="Not PW Reset Email">Not PW Reset Email</option>
        </Select>
      </Box>

      <Textarea
        onChange={(e) => onEmailChange(e.target.value)}
        value={email}
        size="md"
        minH="200px"
        placeholder="Full Email with Headers"
        background="rgb(244, 249, 249)"
        isDisabled={selectedExample !== ""}
      />
      <Heading fontWeight={"400"} size={"sm"}>
        Ethereum address to associate with twitter handle
      </Heading>
      <Box display={"flex"} flexDirection={"row"} gap={"10px"}>
        <Input
          background="rgb(244, 249, 249)"
          value={ethAddress}
          placeholder={"Ethereum Address (0x...)"}
          onChange={(e) => onEthAddressChange(e.target.value)}
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
  );
}
