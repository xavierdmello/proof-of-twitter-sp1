import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Center, useColorModeValue, Icon } from "@chakra-ui/react";
import { AiFillFileAdd } from "react-icons/ai";
import { px } from "framer-motion";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  proofFileName: string;
}

export default function Dropzone({ onFileAccepted, proofFileName }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileAccepted(acceptedFiles[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/octet-stream": [".json"] },
    maxFiles: 1,
    multiple: false,
  });

  let dropText = isDragActive ? "Drop files here..." : "Drag a twitter proof here, or click to select files";
  if (proofFileName.length > 0) {
    dropText = proofFileName;
  }
  const activeBg = useColorModeValue("gray.600", "gray.600");
  const borderColor = useColorModeValue(isDragActive ? "rgb(232, 254, 86)" : "gray.500", isDragActive ? "rgb(232, 254, 86)" : "gray.500");

  return (
    <Center
      p={10}
      cursor="pointer"
      bg={isDragActive ? activeBg : "transparent"}
      _hover={{ bg: activeBg }}
      transition="background-color 0.2s ease"
      borderRadius={4}
      border="3px dashed"
      borderColor={borderColor}
      {...getRootProps()}
      color="gray.100"
      minHeight={"200px"}
      mb={"30px"}
    >
      <input {...getInputProps()} />
      <Icon as={AiFillFileAdd} mr={2} />
      <p>{dropText}</p>
    </Center>
  );
}
