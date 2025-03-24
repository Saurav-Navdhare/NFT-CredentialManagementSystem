import web3 from './web3';
import NFTCMS from '../artifacts/contracts/NFTCMSvDigitalSignature.sol/NFTCMS.json';  // Your contract ABI
import config from '../config';

const contractAddress = config.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(NFTCMS.abi, contractAddress);

export const issueCredential = async (student, ipfsURI, hash, signature) => {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.issueCredential(student, ipfsURI, hash, signature)
        .send({ from: accounts[0] });
};

export const verifyCredential = async (tokenId, hash) => {
    return await contract.methods.verifyCredential(tokenId, hash).call();
};

export const revokeCredential = async (tokenId, reason) => {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.revokeCredential(tokenId, reason)
        .send({ from: accounts[0] });
};

// Add other contract interactions here