import { useSelector } from "react-redux";
import { ConnectButton } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"


const CustomConnectButton = () => {
    const wallets = [
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("com.brave.wallet"),
    ];

    const client = useSelector(state => state.client);
    return (
        <>
            <ConnectButton
                client={client}
                wallets={wallets}
            />
        </>
    )
}

export default CustomConnectButton