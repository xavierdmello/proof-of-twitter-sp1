import { Box, Text, ListItem } from "@chakra-ui/react";

interface InstructionListItemProps {
  step: number;
  content: React.ReactNode;
}

export default function InstructionListItem({ step, content }: InstructionListItemProps) {
  return (
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
        <Text textAlign={"center"}>{step}</Text>
      </Box>
      <Box width={"100%"} backgroundColor={"rgb(244, 249, 249)"} borderRadius={"md"} padding={"5px"} opacity={"0.8"}>
        {content}
      </Box>
    </ListItem>
  );
}
