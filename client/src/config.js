const config = {
    THIRDWEB_CLIENT_ID: import.meta.env.VITE_PUBLIC_THIRDWEB_CLIENT_ID,
    PINATA_JWT: import.meta.env.VITE_PINATA_JWT,
    PINATA_GATEWAY_URL: import.meta.env.VITE_PINATA_GATEWAY_URL,
    IPFS_GATEWAY_URI: import.meta.env.VITE_IPFS_GATEWAY_URI,
    IPFS_HTTP_URI: import.meta.env.VITE_IPFS_HTTP_URI,
    BLOCKCHAIN_PROVIDER: import.meta.env.VITE_BLOCKCHAIN_PROVIDER,
    CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
    BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
};

export default config;