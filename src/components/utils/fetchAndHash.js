import axios from 'axios';
import { keccak256 } from 'js-sha3';

async function fetchAndHash(url) {
    try {
        // Fetch the file from the URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Convert the response data to a Uint8Array
        const fileBytes = new Uint8Array(response.data);

        // Generate the Keccak256 hash
        const hash = keccak256(fileBytes);
        console.log(`Keccak256 hash: ${hash}`);
        return { hash: hash, error: null };
    } catch (error) {
        console.error(`Error fetching or hashing the file: ${error.message}`);
        return { hash: null, error: error };
    }
}


export default fetchAndHash;

console.log(fetchAndHash("https://green-sudden-unicorn-197.mypinata.cloud/ipfs/bafybeiehv44yizbanag7djlirdzww43vp2z6jnhjfawuwottowvklnlbom"))