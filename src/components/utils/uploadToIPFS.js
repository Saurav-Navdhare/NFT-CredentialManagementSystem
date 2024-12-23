import { pinata } from "./config";

const uploadToIPFS = async (file) => {
    try {
        const upload = await pinata.upload.file(file);
        console.log(upload);
        const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);
        console.log(ipfsUrl)
        return { ipfsUrl, upload, error: null };
    } catch (error) {
        console.log(error);
        return { ipfsUrl: null, upload: null, error };
    }
};

export default uploadToIPFS