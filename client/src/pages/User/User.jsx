import { useState } from "react";
import {Button, TextField, Box, Typography} from "@mui/material";
import FetchRecords from "../../components/FetchRecords"; // Assuming FetchRecords is in the components folder
import { FetchCredentialByTokenId } from "../../services/ContractInteraction";
import CredentialInfo from "../../components/utils/CredentialInfo"; // Adjust the import path as necessary

const User = () => {
    const [tokenId, setTokenId] = useState("");
    const [credential, setCredential] = useState(null);
    const [error, setError] = useState("");
    const [recordsDialogOpen, setRecordsDialogOpen] = useState(false); // Manage dialog state

    const [detailDialogOpen, setDetailDialogOpen] = useState(false); // For detail view dialog

    const handleRecordsDialogOpen = () => setRecordsDialogOpen(true); // Open records dialog
    const handleRecordsDialogClose = () => setRecordsDialogOpen(false); // Close records dialog


    // Fetch Credential (Replace with actual API call)
    const fetchCredential = async () => {
        try {
            if (!tokenId) throw new Error("Token ID is required");
            const response = await FetchCredentialByTokenId(tokenId, "user");
            if(response == null){
                setError("Credential not found Or you are not owner of this credential");
                return;
            } else {
                setCredential(response);
                setDetailDialogOpen(true); // Open detail dialog
                setError("");
            }
        } catch (err) {
            setError(err.message);
            setCredential(null);
        }
    };

    return (
        <div className="flex flex-col items-center">

            {/* Token ID Form */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 400 }}>
                <TextField
                    label="Token ID"
                    variant="outlined"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    sx={{ marginBottom: 2, width: "100%" }}
                    color="secondary"
                />

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchCredential}
                    sx={{ marginBottom: 2, backgroundColor: "secondary.main", "&:hover": { backgroundColor: "secondary.dark" } }}
                >
                    Fetch Credential
                </Button>
                
                {detailDialogOpen && (
                    <CredentialInfo
                        detailDialogOpen={detailDialogOpen}
                        setDetailDialogOpen={setDetailDialogOpen}
                        credential={credential}
                        client="user"
                    />
                )}

                {error && <Typography color="error">{error}</Typography>}

                <Button
                    variant="contained"
                    color="info"
                    onClick={handleRecordsDialogOpen} // Open records dialog
                    sx={{ marginTop: 2 }}
                >
                    List Owned Credentials
                </Button>
            </Box>

            {/* FetchRecords Dialog */}
            <FetchRecords
                open={recordsDialogOpen} 
                handleClose={handleRecordsDialogClose} 
                client="user"
            />
        </div>
    );
}

export default User