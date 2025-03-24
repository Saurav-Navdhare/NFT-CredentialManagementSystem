// import { pinata } from "./config";

// const uploadToIPFS = async (file) => {
//     try {
//         const upload = await pinata.upload.file(file);
//         console.log(upload);
//         const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);
//         console.log(ipfsUrl)
//         return { ipfsUrl, upload, error: null };
//     } catch (error) {
//         console.log(error);
//         return { ipfsUrl: null, upload: null, error };
//     }
// };

// export default uploadToIPFS

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
        return { cid, ipfsUrl };
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        return { error: error.message || "File upload failed" };
    }
};

export default uploadToIPFS;
