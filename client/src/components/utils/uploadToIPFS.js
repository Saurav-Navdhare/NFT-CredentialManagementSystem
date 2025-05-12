import axios from 'axios';
import config from "../../config"

const uploadToIPFS = async (file) => {
    if (!file) {
        return { error: "No file selected" };
    }

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${config.IPFS_GATEWAY_URI}/api/v0/add`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!response.data || !response.data.Hash) {
            throw new Error("Invalid response from IPFS node");
        }

        const cid = response.data.Hash;
        const ipfsUrl = `${config.IPFS_HTTP_URI}/ipfs/${cid}`;
        console.log(response)
        return { cid, ipfsUrl };
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        return { error: error.message || "File upload failed" };
    }
};

export default uploadToIPFS;

const uploadJSONToIPFS = async (jsonObject) => {
    if (!jsonObject || typeof jsonObject !== 'object') {
        return { error: "Invalid input. Expected a JavaScript object." };
    }

    try {
        // Convert the JavaScript object to a JSON string
        const jsonString = JSON.stringify(jsonObject);

        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create FormData and append the Blob
        const formData = new FormData();
        formData.append("file", blob, 'data.json');

        // Make the POST request to IPFS
        const response = await axios.post(`${config.IPFS_GATEWAY_URI}/api/v0/add`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!response.data || !response.data.Hash) {
            throw new Error("Invalid response from IPFS node");
        }

        const cid = response.data.Hash;
        const ipfsUrl = `${config.IPFS_HTTP_URI}/ipfs/${cid}`;

        console.log("IPFS Upload Response:", response.data);
        return { cid, ipfsUrl };
    } catch (error) {
        console.error("IPFS JSON Upload Error:", error);
        return { error: error.message || "JSON upload failed" };
    }
};

export { uploadJSONToIPFS };