import { useState, useEffect } from 'react';
import { Textarea, Box, Heading, Text, Highlight, Input, Button  } from '@chakra-ui/react';
import { Divider } from '@chakra-ui/react'
import axios from 'axios';

function App() {
    const [email, setEmail] = useState<string>('');
    const [proof, setProof] = useState<string>('');
    const [ethAddress, setEthAddress] = useState<string>('');

    return (
        <Box backgroundColor={'rgb(244, 249, 249)'} height={'100vh'} width={'100vw'} p="10px">
            <Box
                width={"100%"}
                borderRadius={"20px"}
                backgroundColor={"rgb(101,131,143)"}
                height={"100%"}
                p={"20px"}
                margin={"auto"}
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

                <Box width={"100%"} maxW={'1200px'} zIndex={2} flexDirection={"column"} marginX={'auto'} display="flex" flexGrow={1}>
                    <Divider />
                    <br/>
                    <Box flexGrow={1} display={"flex"} gap={"40px"} flexDirection={"row"}>
                        <Box width={"50%"}>
                            <Heading fontWeight={"300"} size={"md"}>Prove you own a Twitter handle by verifying a confirmation email from Twitter.<br/><br/>Proofs generated using this website are a cryptographic guarantee that a user (identified by their Ethereum address) owns a certain Twitter account, while masking out any private data.<br/><br/> This
                                demo is just one use case of Succinct's open-source zkVM, which lets developers write zero-knowledge proofs in Rust with unbeatable
                                performance.</Heading>
                        </Box>
                        <Box>
                           
                        </Box>
                    </Box>
                    <Box display={"flex"} flexDirection={"column"} gap={"20px"} mb={"20px"} zIndex={2}>
                        <Divider />
                        <Box display={'flex'} flexDirection={'row'} gap={'40px'}>
                            <Box display={'flex'} gap='10px' flexDirection={'column'} width={"100%"}>
                                <Heading fontWeight={"400"} size={'lg'}>Generate Proof</Heading>
                                <Heading fontWeight={"400"} size={'sm'}>Enter your raw email</Heading>
                                <Textarea
                                    onChange={e => setEmail(e.target.value)}
                                    value={email}
                                    size="md"
                                    minH="200px"
                                    placeholder='Full Email with Headers'
                                    background='rgb(244, 249, 249)'
                                />
                                <Heading fontWeight={"400"} size={'sm'}>Ethereum address to associate with twitter handle</Heading>
                                <Box display={'flex'} flexDirection={'row'} gap={'10px'}>
                                    <Input background='rgb(244, 249, 249)' value={ethAddress} placeholder={"Ethereum Address (0x...)"} onChange={e => setEthAddress(e.target.value)} width={'100%'}></Input>
                                    <Button backgroundColor={'rgb(232, 254, 86)'} color={'rgb(5, 14, 22)'} width={'40%'} minW={"180px"}>GENERATE PROOF</Button>
                                </Box>
                            </Box>
                            <Box display={'flex'} gap='10px' flexDirection={'column'} width={"100%"}>
                                <Heading fontWeight={"400"} size={'lg'}>Verify Proof</Heading>
                                <Heading fontWeight={"400"} size={'sm'}>Verify a twitter proof</Heading>
                                <Textarea
                                    onChange={e => setProof(e.target.value)}
                                    value={proof}
                                    size="md"
                                    minH="200px"
                                    placeholder='Twitter Proof'
                                    background='rgb(244, 249, 249)'
                                    mb={"30px"}
                                />
                                <Button backgroundColor={'rgb(232, 254, 86)'} color={'rgb(5, 14, 22)'} minW={"180px"} width={'30%'} marginLeft={"auto"}>VERIFY PROOF</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default App;