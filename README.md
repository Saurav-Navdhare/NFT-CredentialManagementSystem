# NFT based Credentials Management System

This project is a blockchain-based credential management system that uses ERC721 NFTs to represent academic certificates. The smart contract is implemented with Hardhat and OpenZeppelin libraries, and the frontend is built with Thirdweb for seamless interaction with the blockchain.

---

## Features

1. **Mint Academic Credentials:** Institutions can mint NFTs representing academic credentials.
2. **Role-based Access Control:** Granular permissions using OpenZeppelin's `AccessControl`.
3. **Pause/Resume Contract:** Ability to pause contract operations during emergencies.
4. **Expiration Tracking:** Manage certificates with expiration dates.
5. **Frontend Integration:** User-friendly interface powered by Thirdweb.

---
### Illustration
---
####  Illustration of Complete Project
<!--![Illustration of Complete Project](./Role_Functions.drawio.png)-->

```mermaid
   flowchart TD
       A[admin]
       B[moderator]
       C[institute]
       D[student]
       E["Any account"]
   
       subgraph Roles & Functionality
       A --> F["Register Moderator
               Revoke Moderator"]
       B --> G["Register Institute
               Revoke Institute"]
       C --> H["Issue Credential
               Revoke Credential
               List all issued credentials"]
       D --> I["View all owned credentials"]
       D --> K["accept/reject document for verification"]
       E --> J["verify credential
               verify signature"]
       E --> L["request document for verification"]
       end
```
---
#### Off-chain server sequence diagram 
<!-- ![Off-chain server sequence diagram](./Off-Chain%20Server%20Sequence%20Diagram.png) -->
```mermaid
   sequenceDiagram
       autonumber
       participant Client
       participant GoGinAPI
       participant Redis
       participant PostgreSQL
   
       Client->>GoGinAPI: GET /v1/auth/generate-nonce
       GoGinAPI->>Redis: Store nonce with wallet address
       Redis-->>GoGinAPI: Nonce stored
       GoGinAPI-->>Client: Respond with nonce
   
       Client->>Client: Sign nonce with Web3 wallet
       Client->>GoGinAPI: Request with signed nonce in header
       GoGinAPI->>Redis: Retrieve nonce for wallet
       Redis-->>GoGinAPI: Return nonce
       GoGinAPI->>GoGinAPI: Verify digital signature
       alt Signature valid
           GoGinAPI->>Redis: Create and store session
           Redis-->>GoGinAPI: Session stored
           GoGinAPI-->>Client: Respond with session ID
       else Signature invalid
           GoGinAPI-->>Client: Respond with error
       end
   
       Note over Client,GoGinAPI: User authenticated
   
       alt Accessing /v1/requests/create or /v1/requests/respond
           alt No valid session
               Client->>GoGinAPI: GET /v1/auth/generate-nonce
               GoGinAPI->>Redis: Store new nonce with wallet address
               Redis-->>GoGinAPI: Nonce stored
               GoGinAPI-->>Client: Respond with new nonce
               Client->>Client: Sign new nonce with Web3 wallet
               Client->>GoGinAPI: Request with newly signed nonce in header
               GoGinAPI->>Redis: Retrieve new nonce for wallet
               Redis-->>GoGinAPI: Return new nonce
               GoGinAPI->>GoGinAPI: Verify new digital signature
               GoGinAPI->>Redis: Create and store new session
               Redis-->>GoGinAPI: New session stored
           end
           
           alt Accessing /v1/requests/create
               Client->>GoGinAPI: POST /v1/requests/create
               GoGinAPI->>PostgreSQL: Perform requested operation
               PostgreSQL-->>GoGinAPI: Operation result
               GoGinAPI-->>Client: Respond with result
           else Accessing /v1/requests/respond
               Client->>GoGinAPI: POST /v1/requests/respond
               GoGinAPI->>PostgreSQL: Perform requested operation
               PostgreSQL-->>GoGinAPI: Operation result
               GoGinAPI-->>Client: Respond with result
           end
       else Accessing other routes
           Client->>GoGinAPI: Request with session ID
           GoGinAPI->>Redis: Verify session
           Redis-->>GoGinAPI: Session valid
           GoGinAPI->>PostgreSQL: Perform requested operation
           PostgreSQL-->>GoGinAPI: Operation result
           GoGinAPI-->>Client: Respond with result
       end
   
       Note over GoGinAPI,PostgreSQL: Handle automatic expiry
       GoGinAPI->>PostgreSQL: Query expired requests periodically
       PostgreSQL-->>GoGinAPI: Return expired requests
       GoGinAPI->>PostgreSQL: Update expired requests to "revoked"
       PostgreSQL-->>GoGinAPI: Update successful
```

---

## Prerequisites

### Tools Required:
- **Node.js**: [Download here](https://nodejs.org/).
- **Golang**: For backend off-chain server
- **Hardhat**: For smart contract development.
- **Thirdweb SDK**: For frontend blockchain interactions.

Install dependencies:
```bash
npm install
```

---

## Smart Contract Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Saurav-Navdhare/NFT-CredentialManagementSystem
   cd NFT-CredentialManagementSystem
   ```

2. Install Hardhat:
   ```bash
   npm install --save-dev hardhat
   ```

3. Compile the smart contract:
   ```bash
   npx hardhat compile
   ```

4. Deploy the contract:
   ```bash
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

5. Verify the deployment:
   ```bash
   npx hardhat verify <contract-address> --network <network-name>
   ```

---

## Frontend Setup

1. Install the all dependencies:
   ```bash
   npm install 
   ```

2. Start the development server:
   ```bash
   npm run start
   ```

3. Update the contract address in the frontend env file:
   ```env
   CONTRACT_DEPLOYED_ADDRESS= "<deployed-contract-address>";
   ```

---

## Usage

### Minting Credentials:
1. Connect as an authorized institution.
2. Provide student details, expiration dates, and IPFS hash of credentials.
3. Submit the transaction to mint a credential NFT.

### Viewing Credentials:
1. Connect as a student or verifier.
2. View issued credentials along with their status (VALID, REVOKED).

---

## Deployment Notes

- **Networks:** Configure networks in `hardhat.config.js`.
- **Environment Variables:**
  Create a `.env` file with:
```env
VITE_PUBLIC_THIRDWEB_CLIENT_ID=
VITE_PINATA_API_KEY=
VITE_PINATA_API_KEY=
VITE_PINATA_JWT=
GANACHE_PRIVATE_KEY=
CARADONA_PRIVATE_KEY=
CONTRACT_DEPLOYED_ADDRESS=
```

---

## Troubleshooting

### Common Issues:
1. **AccessControlUnauthorizedAccount:**
   Ensure the correct role is assigned for the attempted action.

---

## Future Enhancements

- Add email notifications for certificate expiration.
- Enable on-chain revocation alerts.

---

## License
This project is licensed under the MIT License. See `LICENSE` for details.

---

## Acknowledgments
- OpenZeppelin for secure smart contract libraries.
- Thirdweb for easy blockchain integration.
- Hardhat for powerful development tools.
