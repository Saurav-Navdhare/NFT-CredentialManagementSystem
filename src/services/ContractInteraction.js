import web3 from './web3';
import NFTCMS from '../artifacts/contracts/NFTCMSvDigitalSignature.sol/NFTCMS.json';  // Your contract ABI
import config from '../config';

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
