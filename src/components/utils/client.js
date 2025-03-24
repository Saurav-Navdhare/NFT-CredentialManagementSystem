import { createThirdwebClient } from "thirdweb";
import config from "../../config"

export const createClient = () => {
    return createThirdwebClient({
        clientId: config.THIRDWEB_CLIENT_ID,
    });
}