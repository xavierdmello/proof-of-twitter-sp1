import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import "./index.css";
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '@fontsource/ibm-plex-mono';
import '@fontsource/ibm-plex-mono/500.css';

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
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: '500',
      },
      variants: {
        solid: {
          bg: 'rgb(7,42,57)',
          color: 'white',
          _hover: {
            bg: 'rgb(10,60,80)',
            color: "white"
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </React.StrictMode>,
);