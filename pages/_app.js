import { NextUIProvider } from '@nextui-org/react';
import { createTheme } from "@nextui-org/react";
import Defiswap from './defiswap';
import { Web3Button } from '@web3modal/react';
import Swap from './swap';


const darkTheme = createTheme({
  type: 'dark',
});

function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider theme={darkTheme}>
      <Component {...pageProps} />
      {/*<Web3Button />*/}
      <Defiswap />
      <Swap/>
    </NextUIProvider>
  );
}

export default MyApp;