import './App.css'
import Button from '@mui/material/Button';
import { client } from "./client";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets"

function App() {

  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("com.brave.wallet"),
  ];

  return (
    <>
      <div>
        <ConnectButton
          client={client}
          wallets={wallets}
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold underline mb-5">Welcome to NFT CMS</h1>
        <Button variant="outlined">Hello world</Button>
      </div>
    </>
  )
}

export default App
