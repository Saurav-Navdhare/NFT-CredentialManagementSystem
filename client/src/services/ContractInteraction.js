import web3 from './web3';
import NFTCMS from '../artifacts/contracts/NFTCMSvDigitalSignature.sol/NFTCMS.json';  // Your contract ABI
import config from '../config';
import { uploadJSONToIPFS } from '../components/utils/uploadToIPFS';

const contractAddress = config.CONTRACT_ADDRESS;
const abi = JSON.parse(JSON.stringify(NFTCMS.abi));
export const contract = new web3.eth.Contract(abi, contractAddress);

export const FetchRole = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        const role = await contract.methods.fetchRole().call({ from: account });
        return role;
    } catch (error) {
        console.error("Error fetching role:", error);
        throw error;
    }
}

export const RegisterModerator = async (address, name) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    if (!web3.utils.isAddress(address)) {
        throw new Error("Invalid address");
    }

    try {
        await contract.methods.registerModerator(address, name).send({ from: account });
    } catch (error) {
        if (error.message.includes("Only admin can add a moderator")) {
            console.error("Permission denied: Only admin can add a moderator");
        } else {
            let errorMessage = "Failed to register moderator.";

            if (error.data) {
                errorMessage = error.data.message || JSON.stringify(error.data);
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
        throw error;
    }
}

export const RevokeModerator = async (address, reason) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    if (!web3.utils.isAddress(address)) {
        throw new Error("Invalid address");
    }

    try {
        await contract.methods.revokeModerator(address, reason).send({ from: account });
    } catch (error) {
        if (error.message.includes("Only admin can revoke a moderator")) {
            console.error("Permission denied: Only admin can add a moderator");
        } else {
            console.error("Error adding moderator:", error);
        }
        throw error;
    }
}

export const FetchModerators = async () => {
    const startBlock = 0;

    const [registeredEvents, revokedEvents] = await Promise.all([
        contract.getPastEvents("ModeratorRegistered", { fromBlock: startBlock, toBlock: "latest" }),
        contract.getPastEvents("ModeratorRevoked", { fromBlock: startBlock, toBlock: "latest" })
    ]);

    const moderatorMap = new Map();

    registeredEvents.forEach(event => {
        const { moderator, name } = event.returnValues;
        if (!moderatorMap.has(moderator)) {
            moderatorMap.set(moderator, { count: 0, name: '' });
        }
        const moderatorData = moderatorMap.get(moderator);
        moderatorData.count += 1;
        moderatorData.name = name;
    });

    revokedEvents.forEach(event => {
        const { moderator } = event.returnValues;
        if (moderatorMap.has(moderator)) {
            const moderatorData = moderatorMap.get(moderator);
            moderatorData.count -= 1;
        }
    });

    const activeModerators = Array.from(moderatorMap.entries())
        .filter(([, data]) => data.count > 0)
        .map(([address, data]) => ({
            address,
            name: data.name
        }));

    return activeModerators;
};


export const CheckIfModerator = async (address) => {
    try {
        const registeredEvents = await contract.getPastEvents("ModeratorRegistered", {
            filter: { moderator: address },
            fromBlock: 0,
            toBlock: "latest",
        });

        const revokedEvents = await contract.getPastEvents("ModeratorRevoked", {
            filter: { moderator: address },
            fromBlock: 0,
            toBlock: "latest",
        });

        const registeredCount = registeredEvents.length;
        const revokedCount = revokedEvents.length;

        if (registeredCount > revokedCount) {
            const latestRegistration = registeredEvents[registeredCount - 1]; // Last registered event
            return { exists: true, name: latestRegistration.returnValues.name };
        }

        return { exists: false };
    } catch (error) {
        console.error("Error checking moderator status:", error);
        return { exists: false, error: error.message };
    }
};


// Moderator Functions

export const RegisterInstitution = async (address, name) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    if (!web3.utils.isAddress(address)) {
        throw new Error("Invalid address");
    }

    try {
        await contract.methods.registerInstitution(address, name).send({ from: account });
    } catch (error) {
        if (error.message.includes("Only moderator can add an institution")) {
            console.error("Permission denied: Only a moderator can add an institution");
        } else {
            let errorMessage = "Failed to register institution.";

            if (error.data) {
                errorMessage = error.data.message || JSON.stringify(error.data);
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
        throw error;
    }
};

export const RevokeInstitution = async (address, reason) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    if (!web3.utils.isAddress(address)) {
        throw new Error("Invalid address");
    }

    try {
        await contract.methods.revokeInstitution(address, reason).send({ from: account });
    } catch (error) {
        if (error.message.includes("Only moderator can revoke an institution")) {
            console.error("Permission denied: Only a moderator can revoke an institution");
        } else {
            console.error("Error revoking institution:", error);
        }
        throw error;
    }
};

export const FetchInstitutions = async () => {
    const startBlock = 0;

    const [registeredEvents, revokedEvents] = await Promise.all([
        contract.getPastEvents("InstitutionRegistered", { fromBlock: startBlock, toBlock: "latest" }),
        contract.getPastEvents("InstitutionRevoked", { fromBlock: startBlock, toBlock: "latest" })
    ]);

    const institutionMap = new Map();

    registeredEvents.forEach(event => {
        const { institution, name } = event.returnValues;
        if (!institutionMap.has(institution)) {
            institutionMap.set(institution, { count: 0, name: '' });
        }
        const institutionData = institutionMap.get(institution);
        institutionData.count += 1;
        institutionData.name = name;
    });

    revokedEvents.forEach(event => {
        const { institution } = event.returnValues;
        if (institutionMap.has(institution)) {
            const institutionData = institutionMap.get(institution);
            institutionData.count -= 1;
        }
    });

    const activeInstitutions = Array.from(institutionMap.entries())
        .filter(([, data]) => data.count > 0)
        .map(([address, data]) => ({
            address,
            name: data.name
        }));

    return activeInstitutions;
};

export const CheckIfInstitution = async (address) => {
    try {
        const registeredEvents = await contract.getPastEvents("InstitutionRegistered", {
            filter: { institution: address },
            fromBlock: 0,
            toBlock: "latest",
        });

        const revokedEvents = await contract.getPastEvents("InstitutionRevoked", {
            filter: { institution: address },
            fromBlock: 0,
            toBlock: "latest",
        });

        const registeredCount = registeredEvents.length;
        const revokedCount = revokedEvents.length;

        if (registeredCount > revokedCount) {
            const latestRegistration = registeredEvents[registeredCount - 1]; // Last registered event
            return { exists: true, name: latestRegistration.returnValues.name };
        }

        return { exists: false };
    } catch (error) {
        console.error("Error checking institution status:", error);
        return { exists: false, error: error.message };
    }
};

export const IssueCredential = async (_student, _ipfsURI, fileHash, title) => {
    // digitally sign the fileHash first
    const accounts = await web3.eth.getAccounts();
    const signer = accounts[0];
    console.log("fileHash", fileHash);

    // Ensure fileHash is a valid 32-byte hex string (0x + 64 hex chars)
    let fileHashHex = fileHash;
    if (typeof fileHash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(fileHash)) {
        throw new Error("fileHash must be a 32-byte hex string (0x + 64 hex chars)");
    }

    const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fileHashHex, signer],
    });
    let metadata = {
        title: title,
        institution: signer,
        fileHash: fileHashHex,
        ipfsURI: _ipfsURI,
        signature: signature,
        dateOfIssuance: new Date().toISOString()
    };
    // upload the metadata to IPFS
    const metadataHash = await uploadJSONToIPFS(metadata);
    console.log("Metadata", metadata);
    console.log("Metadata Hash", metadataHash);
    // then send the transaction to the contract
    try {
        await contract.methods.issueCredential(_student, _ipfsURI, fileHashHex, signature, title).send({ from: signer });
    } catch (error) {
        console.log("Error issuing credential:", error);
    }
}

export const FetchInstitutionCredentials = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // institution address
    try {
        // Fetch all credentials issued by this institution
        const issuedEvents = await contract.getPastEvents("CredentialIssued", {
            filter: { institution: account },
            fromBlock: 0,
            toBlock: "latest",
        });

        // Fetch all credential status change events (for revocation tracking)
        const statusChangedEvents = await contract.getPastEvents("CredentialStatusChanged", {
            fromBlock: 0,
            toBlock: "latest",
        });

        // Build a set of revoked tokenIds
        const revokedTokenIds = new Set(
            statusChangedEvents.map(event => Number(event.returnValues.tokenId))
        );

        console.log("Revoked Token IDs:", revokedTokenIds);

        // Only return credentials that are not revoked
        const credentials = issuedEvents
            .map((event) => ({
                tokenId: Number(event.returnValues.tokenId),
                student: event.returnValues.student,
                title: event.returnValues.title,
                revoked: revokedTokenIds.has(Number(event.returnValues.tokenId))
            }))
            .sort((a, b) => {
                // Non-revoked first, revoked last
                if (a.revoked === b.revoked) return 0;
                return a.revoked ? 1 : -1;
            });

        return credentials;
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return [];
    }
};

export const FetchCredentialByTokenId = async (tokenId) => {
    try {
        // Ensure tokenId is a string representing a uint256
        let tokenIdUint256;
        if (typeof tokenId === "number" || typeof tokenId === "string") {
            tokenIdUint256 = tokenId.toString();
        } else {
            throw new Error("Invalid tokenId type");
        }

        const credential = await contract.methods.credentials(tokenIdUint256).call();
        console.log(credential)
        // The returned object will have fields as per your Credential struct
        return credential;
    } catch (error) {
        console.error("Error fetching credential by tokenId:", error);
        throw error;
    }
};

export const RevokeCredential = async (tokenId, reason = "any") => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        await contract.methods.revokeCredential(tokenId, reason).send({ from: account });
    } catch (error) {
        console.error("Error revoking credential:", error);
        throw error;
    }
};