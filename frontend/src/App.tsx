import { useState, useEffect } from 'react';
import { Textarea, Box, Heading } from '@chakra-ui/react';
import axios from 'axios';

function App() {
    const [email, setEmail] = useState<string>('');

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
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "30%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0))",
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
            -70deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px,
            transparent 50px
          )`}
                />
                <Heading fontWeight={"600"} marginX={"auto"} zIndex={2}>
                    Proof Of Twitter: SP1 ZK Email Demo
                </Heading>
                <Heading fontWeight={"500"} size={'lg'} zIndex={2}>Email Input</Heading>
                <Textarea
                    onChange={e => setEmail(e.target.value)}
                    value={email}
                    size="md"
                    minH="200px"
                    placeholder='Full Email with Headers'
                    background={"rgb(244, 249, 249)"}
                    zIndex={2}
                />
            </Box>
        </Box>
    );
}

export default App;