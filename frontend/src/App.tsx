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

                <Divider />
                <Box display={'flex'} flexDirection={'row'} gap={'40px'} zIndex={2}>
                    <Box display={'flex'} gap='10px' flexDirection={'column'} width={"100%"}>
                        <Heading fontWeight={"400"} size={'lg'} zIndex={2}>Generate Proof</Heading>
                        <Heading fontWeight={"400"} size={'sm'}>Enter your raw email</Heading>
                        <Textarea
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            size="md"
                            minH="200px"
                            placeholder='Full Email with Headers'
                            zIndex={2}
                            background='rgb(244, 249, 249)'
                        />
                        <Heading fontWeight={"400"} size={'sm'}>Ethereum address to associate with twitter handle</Heading>
                        <Box display={'flex'} flexDirection={'row'} gap={'10px'}>
                            <Input background='rgb(244, 249, 249)' value={ethAddress} placeholder={"Ethereum Address (0x...)"} onChange={e => setEthAddress(e.target.value)}></Input>
                            <Button backgroundColor={'rgb(232, 254, 86)'} color={'rgb(5, 14, 22)'} fontWeight={"500"}>Generate Proof</Button>
                        </Box>
                    </Box>
                    <Box display={'flex'} gap='10px' flexDirection={'column'} width={"100%"}>
                        <Heading fontWeight={"400"} size={'lg'} zIndex={2}>Verify Proof</Heading>
                        <Heading fontWeight={"400"} size={'sm'}>Verify a twitter proof</Heading>
                        <Textarea
                            onChange={e => setProof(e.target.value)}
                            value={proof}
                            size="md"
                            minH="200px"
                            placeholder='Twitter Proof'
                            background='rgb(244, 249, 249)'
                            zIndex={2}
                        />

                    </Box>
                </Box>

            </Box>
        </Box>
    );
}

export default App;