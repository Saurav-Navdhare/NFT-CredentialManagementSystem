import web3 from './web3';
import NFTCMS from '../artifacts/contracts/NFTCMSvDigitalSignature.sol/NFTCMS.json';  // Your contract ABI
import config from '../config';
import { uploadJSONToIPFS } from '../components/utils/uploadToIPFS';
import axios from 'axios';

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
    console.log({
        _student,
        _ipfsURI,
        fileHash,
        title,
        signer
    })

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
    console.log("Metadata Hash", metadataHash.ipfsUrl);
    // then send the transaction to the contract
    try {
        await contract.methods.issueCredential(_student, metadataHash.ipfsUrl, fileHashHex, signature, title).send({ from: signer });
        // fetch TokenId from the event
        // Fetch all CredentialIssued events for this student and institution
        const events = await contract.getPastEvents("CredentialIssued", {
            filter: { student: _student, institution: signer },
            fromBlock: 0,
            toBlock: "latest",
        });
        // Get the last event (most recent tokenId)
        if (!events.length) {
            throw new Error("No CredentialIssued event found for this issuance.");
        }
        const tokenId = Number(events[events.length - 1].returnValues.tokenId);
        // const tokenId = Number(events[0].returnValues.tokenId);

        let data = {
            transcript_id: tokenId.toString(),
            ipfs_uri_metadata: metadataHash.ipfsUrl,
            ipfs_uri_media_hash: _ipfsURI,
            owner_wallet: _student
        }

        console.log("data", data);
        // Try with signature first, but only if signature exists
        /**
         * const response = await axios.post(
                    `${config.BACKEND_URL}/transcripts/`,
                    {
                        transcript_id: tokenId,
                        ipfs_uri_metadata: metadataHash.ipfsUrl,
                        ipfs_uri_media_hash: _ipfsURI,
                        owner_wallet: _student
                    },
                    { headers }
                );
         */
        let headers = {
            'Wallet-Address': signer
        };
        // Try with session-token if available
        // Try with session-token if available
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken) {
            headers['session-token'] = sessionToken;
        } else {
            // No session-token, sign nonce
            let signature = await generateNonceAndSign(signer);
            if (signature === null) {
                console.error("Nonce generation failed");
                return null;
            }
            headers['Signature'] = signature;
        }

        try {
            const response = await axios.post(
                `${config.BACKEND_URL}/transcripts/`,
                {
                    ...data
                },
                { headers }
            );

            if (response.headers['session-token']) {
                localStorage.setItem('session_token', response.headers['session-token']);
            }
            return response.data;
        } catch (error) {
            // If unauthorized and session-token was used, try with fresh signature
            if (
                error.response &&
                error.response.status === 401 &&
                sessionToken
            ) {
                // Remove invalid session-token and try again with signature
                localStorage.removeItem('session_token');
                let signature = await generateNonceAndSign(signer);
                if (signature === null) {
                    console.error("Nonce generation failed");
                    return null;
                }
                headers = {
                    'Wallet-Address': signer,
                    'Signature': signature
                };
                try {
                    const retryResponse = await axios.post(
                        `${config.BACKEND_URL}/transcripts/`,
                        {
                            ...data
                        },
                        { headers }
                    );
                    if (retryResponse.headers['session-token']) {
                        localStorage.setItem('session_token', retryResponse.headers['session-token']);
                    }
                    return retryResponse.data;
                } catch (retryError) {
                    console.error("Error fetching access requests after retry:", retryError);
                    return null;
                }
            } else {
                console.error("Error fetching access requests:", error);
                return null;
            }
        }
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

export const FetchCredentialByTokenId = async (tokenId, client) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0]; // institution address
    try {
        // Ensure tokenId is a string representing a uint256
        let tokenIdUint256;
        if (typeof tokenId === "number" || typeof tokenId === "string") {
            tokenIdUint256 = tokenId.toString();
        } else {
            throw new Error("Invalid tokenId type");
        }

        let credential;
        credential = await contract.methods.credentials(tokenIdUint256).call();
        if (credential.tokenId === "0") {
            return null; // Credential not found
        }
        credential.tokenId = credential.tokenId.toString();
        credential.status = credential.status.toString();
        credential.ipfsURI = credential.ipfsURI.toString();

        if (client === "institute") {
            if (credential.signer !== account) {
                return null;
            }
        } else {
            const owner = await contract.methods.ownerOf(tokenIdUint256).call();
            if (owner !== account) {
                return null;
            }
        }
        return credential;
    } catch (error) {
        console.error("Error fetching credential by tokenId:", error);
        return null;
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

export const FetchStudentCredentials = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    try {
        // Fetch all credentials issued by this institution
        const issuedEvents = await contract.getPastEvents("CredentialIssued", {
            filter: { student: account },
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

        // console.log("Revoked Token IDs:", revokedTokenIds);

        // Only return credentials that are not revoked
        const credentials = issuedEvents
            .map((event) => ({
                tokenId: Number(event.returnValues.tokenId),
                institution: event.returnValues.institution,
                title: event.returnValues.title,
                revoked: revokedTokenIds.has(Number(event.returnValues.tokenId))
            }))
            .sort((a, b) => {
                // Non-revoked first, revoked last
                if (a.revoked === b.revoked) return 0;
                return a.revoked ? 1 : -1;
            });
        console.log("Credentials", credentials);
        return credentials;
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return [];
    }
}

const generateNonceAndSign = async (walletAddress) => {
    let nonce = await axios.get(
        `${config.BACKEND_URL}/auth/generate-nonce`,
        { headers: { 'Wallet-Address': walletAddress } }
    );
    if (nonce.data.id === null) {
        console.error("Nonce generation failed");
        return null;
    }
    nonce = nonce.data.id;

    // personal sign nonce
    const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [nonce, walletAddress],
    });
    return signature;
}

export const RaiseAccessRequest = async (body) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
        let signature = await generateNonceAndSign(account);
        if (signature === null) {
            console.error("Nonce generation failed");
            return null;
        }
        // send the request to the backend
        // POST /v1/requests/create
        const response = await axios.post(
            `${config.BACKEND_URL}/requests/create`,
            {
                ...body,
            },
            { headers: { 'Wallet-Address': account, 'Signature': signature } }
        );
        const sessionToken = response.headers['session-token'];
        if (sessionToken) {
            localStorage.setItem('session_token', sessionToken);
        }
        console.log("Response", response.data);
        return response.data;

    } catch (error) {
        console.error("Error raising access request:", error);
        return null;
    }

}

export const GetAccessRequests = async (wallet_type) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    let headers = {
        'Wallet-Address': account
    };

    // Try with session-token if available
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        headers['session-token'] = sessionToken;
    } else {
        // No session-token, sign nonce
        let signature = await generateNonceAndSign(account);
        if (signature === null) {
            console.error("Nonce generation failed");
            return null;
        }
        headers['Signature'] = signature;
    }

    try {
        const response = await axios.get(`${config.BACKEND_URL}/requests/${wallet_type}`, {
            headers: headers
        });

        if (response.headers['session-token']) {
            localStorage.setItem('session_token', response.headers['session-token']);
        }
        return response.data;
    } catch (error) {
        // If unauthorized and session-token was used, try with fresh signature
        if (
            error.response &&
            error.response.status === 401 &&
            sessionToken
        ) {
            // Remove invalid session-token and try again with signature
            localStorage.removeItem('session_token');
            let signature = await generateNonceAndSign(account);
            if (signature === null) {
                console.error("Nonce generation failed");
                return null;
            }
            headers = {
                'Wallet-Address': account,
                'Signature': signature
            };
            try {
                const retryResponse = await axios.get(`${config.BACKEND_URL}/requests/${wallet_type}`, {
                    headers: headers
                });
                if (retryResponse.headers['session-token']) {
                    localStorage.setItem('session_token', retryResponse.headers['session-token']);
                }
                return retryResponse.data;
            } catch (retryError) {
                console.error("Error fetching access requests after retry:", retryError);
                return null;
            }
        } else {
            console.error("Error fetching access requests:", error);
            return null;
        }
    }
}

export const FetchAccessTranscript = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    let headers = {
        'Wallet-Address': account
    };

    // Try with session-token if available
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        headers['Session-Token'] = sessionToken;
    } else {
        // No session-token, sign nonce
        let signature = await generateNonceAndSign(account);
        if (signature === null) {
            console.error("Nonce generation failed");
            return null;
        }
        headers['Signature'] = signature;
    }

    try {
        console.log("Headers", headers);
        const response = await axios.get(`${config.BACKEND_URL}/transcripts/`, { headers });
        if (response.headers['session-token']) {
            localStorage.setItem('session_token', response.headers['session-token']);
        }
        console.log("Response", response.data);
        if (response.data.status_code === 422) {
            let signature = await generateNonceAndSign(account);
            if (signature === null) {
                return null;
            }
            headers['Signature'] = signature;
            const responseAgain = await axios.get(`${config.BACKEND_URL}/transcripts/`, {
                headers: headers
            });

            if (responseAgain.headers['session-token']) {
                localStorage.setItem('session_token', responseAgain.headers['session-token']);
            }
            return responseAgain.data;
        }
        return response.data;
    } catch (error) {
        // If unauthorized and session-token was used, try with fresh signature
        if (
            error.response &&
            error.response.status === 401 &&
            sessionToken
        ) {
            // Remove invalid session-token and try again with signature
            localStorage.removeItem('session_token');
            let signature = await generateNonceAndSign(account);
            if (signature === null) {
                return null;
            }
            headers = {
                'Wallet-Address': account,
                'Signature': signature
            };
            try {
                const retryResponse = await axios.get(`${config.BACKEND_URL}/transcripts/`, {
                    headers: headers
                });
                if (retryResponse.headers['session-token']) {
                    localStorage.setItem('session_token', retryResponse.headers['session-token']);
                }
                return retryResponse.data;
            } catch (retryError) {
                console.error("Error fetching access requests after retry:", retryError);
                return null;
            }
        } else {
            console.error("Error fetching access requests:", error);
            return null;
        }
    }
}

export const SubmitResponse = async (payload) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    let headers = {
        'Wallet-Address': account
    };
    // clear session token if exists
    localStorage.removeItem('session_token');
    // generate and sign nonce
    let signature = await generateNonceAndSign(account);
    if (signature === null) {
        console.error("Nonce generation failed");
        return null;
    }
    headers['Signature'] = signature;
    try {
        const res = await axios.post(
            `${config.BACKEND_URL}/requests/respond/${payload.request_id}`,
            {
                // request_id,
                response: payload.response,
                transcript_list: payload.transcript_list,
                reason: payload.reason
            },
            { headers }
        );
        if (res.headers['session-token']) {
            localStorage.setItem('session_token', res.headers['session-token']);
        }
        return res.data;
    } catch (error) {
        console.error("Error submitting response:", error);
        return null;
    }
}

export const GetRequestStatus = async (request_id, viewType) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    let headers = {
        'Wallet-Address': account
    };

    // Try with session-token if available
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        headers['session-token'] = sessionToken;
    } else {
        // No session-token, sign nonce
        let signature = await generateNonceAndSign(account);
        if (signature === null) {
            console.error("Nonce generation failed");
            return null;
        }
        headers['Signature'] = signature;
    }

    try {
        const response = await axios.get(`${config.BACKEND_URL}/requests/${viewType === 'sent' ? "recipient_wallet" : "student_wallet"}/${request_id}`, { headers });
        if (response.headers['session-token']) {
            localStorage.setItem('session_token', response.headers['session-token']);
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching request status:", error);
        // If unauthorized and session-token was used, try with fresh signature
        if (
            error.response &&
            error.response.status === 401 &&
            sessionToken
        ) {
            // Remove invalid session-token and try again with signature
            localStorage.removeItem('session_token');
            let signature = await generateNonceAndSign(account);
            if (signature === null) {
                console.error("Nonce generation failed");
                return null;
            }
            headers = {
                'Wallet-Address': account,
                'Signature': signature
            };
            try {
                const retryResponse = await axios.get(`${config.BACKEND_URL}/requests/${request_id}`, {
                    headers: headers
                });
                if (retryResponse.headers['session-token']) {
                    localStorage.setItem('session_token', retryResponse.headers['session-token']);
                }
                return retryResponse.data;
            } catch (retryError) {
                console.error("Error fetching request status after retry:", retryError);
                return null;
            }
        } else {
            console.error("Error fetching request status:", error);
        }
        return null;
    }
}