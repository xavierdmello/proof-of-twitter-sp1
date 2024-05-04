import { useState, useEffect } from 'react'
import { Textarea, Box, Heading} from '@chakra-ui/react'


function App() {

  const [email, setEmail] = useState<string>('')



  return (
    <Box backgroundColor={'rgb(244, 249, 249)'} height={'100vh'} width={'100vw'} py="10px">
      <Box width={"80%"} maxW={"1000px"}  borderRadius={"20px"} backgroundColor={"rgb(64,96,109)"} height={"100%"} p={"20px"} margin={"auto"} display={"flex"} flexDirection={"column"} gap={"15px"} >
        <Heading>Email Input</Heading>
        <Textarea onChange={e => setEmail(e.target.value)} size="md" minH="200px" color="black" placeholder='Full Email with Headers' background={"rgb(244, 249, 249)"}></Textarea>

        <Heading>SP1 Inputs</Heading>
        <Textarea size="md" minH="200px" color={"black"} isReadOnly placeholder='Generated Inputs for SP1 Program' background={"rgb(244, 249, 249)"}></Textarea>
      </Box>
    </Box>
  )
}

export default App
