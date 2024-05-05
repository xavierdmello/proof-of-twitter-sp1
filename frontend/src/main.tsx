import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./index.css"
import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'black',
      },
      h1: {
        color: 'white',
      },
      h2: {
        color: 'white',
      },
      h3: {
        color: 'white',
      },
      h4: {
        color: 'white',
      },
      h5: {
        color: 'white',
      },
      h6: {
        color: 'white',
      },
      textarea: {
        _placeholder: {
          color: 'gray',
        },
      },
      input: {
        _placeholder: {
          color: 'gray',
        },
      },
    },
  },
  fonts: {
    body: 'ABCFavorit, sans-serif',
    heading: 'ABCFavorit, sans-serif',
  },
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>

  </React.StrictMode>,
)
