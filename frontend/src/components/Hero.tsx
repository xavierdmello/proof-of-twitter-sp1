import { Box, Heading, List, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import InstructionListItem from "./InstructionListItem";

export default function Hero() {
  return (
    <Box flexGrow={1} alignItems="center" display={"flex"} gap={"40px"} flexDirection={"row"}>
      {/* Left Side of Hero (Intro) */}
      <Box width={"30%"}>
        <Heading fontWeight={"300"} fontSize={"20px"}>
          Prove you own a Twitter handle by verifying a confirmation email from Twitter.
        </Heading>
        <br />
        <Heading fontWeight={"300"} fontSize={"17px"}>
          Proofs generated using this website are a cryptographic guarantee that a user owns a certain Twitter account, while masking out any private data.
          <br />
          <br /> This demo is just one use case of Succinct's open-source zkVM, which lets developers write zero-knowledge proofs in Rust with unbeatable
          performance.
        </Heading>
      </Box>
      {/* Right Side of Hero (Instructions) */}
      <Box width="70%">
        <List spacing={"7px"}>
          <InstructionListItem
            step={1}
            content={
              <>
                Send yourself a{" "}
                <Link href={"https://twitter.com/account/begin_password_reset"} isExternal>
                  {" "}
                  password reset email
                  <ExternalLinkIcon mx="2px" />
                </Link>{" "}
                from Twitter. (Twitter names with emoji might fail to pass DKIM verification)
              </>
            }
          />
          <InstructionListItem
            step={2}
            content="In your inbox, find the email from Twitter and click the three dot menu, then 'Show original' then 'Copy to clipboard'. If on Outlook, download the original email as .eml and copy it instead."
          />
          <InstructionListItem
            step={3}
            content="Copy paste or drop that into the box below. Note that we cannot use this to phish you: we do not know your password."
          />
          <InstructionListItem
            step={4}
            content="Paste in your sending Ethereum address. This associates your twitter handle with an ethereum address and ensures that no one else can 'steal' your proof for another account"
          />
          <InstructionListItem
            step={5}
            content={
              <>
                Click&nbsp;<b>"Generate Proof"</b> (will take ~4 minutes). Share this to privately prove your Twitter handle ownership!
              </>
            }
          />
        </List>
      </Box>
    </Box>
  );
}
