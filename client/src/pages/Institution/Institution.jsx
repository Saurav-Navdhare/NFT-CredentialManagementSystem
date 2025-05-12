import { useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent,
    TextField, IconButton, Box, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadMedia from "../../components/UploadMedia";
import FetchRecords from "../../components/FetchRecords"; // Assuming FetchRecords is in the components folder

const Institution = () => {
    const [open, setOpen] = useState(false);
    const [tokenId, setTokenId] = useState("");
    const [credential, setCredential] = useState(null);
    const [error, setError] = useState("");
    const [recordsDialogOpen, setRecordsDialogOpen] = useState(false); // Manage dialog state

    // Open & Close Dialog
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleRecordsDialogOpen = () => setRecordsDialogOpen(true); // Open records dialog
    const handleRecordsDialogClose = () => setRecordsDialogOpen(false); // Close records dialog


    // Fetch Credential (Replace with actual API call)
    const fetchCredential = async () => {
        try {
            if (!tokenId) throw new Error("Token ID is required");

            // Simulated API call
            const response = await fetch(`/api/getCredential?tokenId=${tokenId}`);
            const data = await response.json();

            if (!data.success) throw new Error(data.message || "Credential not found");

            setCredential(data.credential);
            setError("");
        } catch (err) {
            setError(err.message);
            setCredential(null);
        }
    };

    // Revoke Credential (Replace with actual API call)
    const revokeCredential = async () => {
        try {
            if (!credential) throw new Error("No credential fetched");

            // Simulated API call
            const response = await fetch(`/api/revokeCredential`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenId }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Failed to revoke credential");

            setCredential(null);
            setError("");
            alert("Credential revoked successfully!");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Issue Credential Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                sx={{ marginBottom: 2, backgroundColor: "secondary.main", "&:hover": { backgroundColor: "secondary.dark" } }}
            >
                Issue Credential
            </Button>

            {/* UploadMedia Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                fullScreen
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "#1A1A1D",  // Matches HTML background
                        color: "white"
                    }
                }}
            >
                {/* Dialog Title with Close Button */}
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#1A1A1D",
                    color: "white"
                }}>
                    Issue Credential
                    <IconButton onClick={handleClose} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                {/* Dialog Content - Takes full screen */}
                <DialogContent sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    backgroundColor: "#1A1A1D",
                    color: "white",
                    padding: "20px"
                }}>
                    <UploadMedia />
                </DialogContent>
            </Dialog>


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

                {credential && (
                    <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                        <Typography variant="body1" sx={{ color: "text.primary" }}>Credential Details:</Typography>
                        <Typography variant="body2" sx={{ color: "secondary.dark" }}>{JSON.stringify(credential)}</Typography>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={revokeCredential}
                            sx={{ marginTop: 2 }}
                        >
                            Revoke Credential
                        </Button>
                    </Box>
                )}

                {error && <Typography color="error">{error}</Typography>}

                <Button
                    variant="contained"
                    color="info"
                    onClick={handleRecordsDialogOpen} // Open records dialog
                    sx={{ marginTop: 2 }}
                >
                    List Issued Credentials
                </Button>
            </Box>

            {/* FetchRecords Dialog */}
            <FetchRecords open={recordsDialogOpen} handleClose={handleRecordsDialogClose} />
        </div>
    );
}

export default Institution