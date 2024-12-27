import { createThirdwebClient } from "thirdweb";

export const createClient = () => {
    return createThirdwebClient({
        clientId: import.meta.env.VITE_PUBLIC_THIRDWEB_CLIENT_ID,
    });
}