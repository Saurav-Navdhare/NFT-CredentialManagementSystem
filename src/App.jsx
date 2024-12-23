import './App.css'
import { client } from "./client";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets"
import UploadMedia from './components/utils/UploadMedia';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';

function App() {

  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("com.brave.wallet"),
  ];

  const theme = createTheme({
    palette: {
      // use this color palette 1A1A1D 3B1C32 6A1E55 A64D79
      primary: {
        main: '#A64D79',
      },
      secondary: {
        main: '#3B1C32',
        light: '#6A1E55'
      }
    }
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="min-h-screen rounded-lg">
          <div>
            <ConnectButton
              client={client}
              wallets={wallets}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold underline mb-5">Welcome to NFT CMS</h1>
            <br />
            <UploadMedia
              classNames="p-16 mt-10 border border-neutral-500"
            />
          </div>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
