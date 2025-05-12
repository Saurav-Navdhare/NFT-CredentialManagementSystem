import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Button,
    DialogActions, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GridTable from "./GridTable";
import { FetchInstitutionCredentials, FetchCredentialByTokenId, RevokeCredential } from "../services/ContractInteraction";
import PropTypes from "prop-types";
// import axios from 'axios'; // For making the HTTP request to IPFS

const FetchRecords = ({ open, handleClose }) => {
    const [issuedCredentials, setIssuedCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // For detail view dialog
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [originalStatus, setOriginalStatus] = useState("");

    useEffect(() => {
        const fetchIssuedCredentials = async () => {
            setLoading(true);
            try {
                let credentials = await FetchInstitutionCredentials();
                credentials = credentials.map((credential) => ({
                    tokenId: credential.tokenId,
                    student: credential.student,
                    title: credential.title,
                    id: credential.tokenId,
                }));
                console.log("Fetched credentials:", credentials)
                setIssuedCredentials(credentials);
            } catch (err) {
                setError("Failed to fetch issued credentials");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchIssuedCredentials();
        }
    }, [open]);

    // Handle row click
    const handleClick = async (row) => {
        try {
            const credential = await FetchCredentialByTokenId(row);
            setSelectedCredential(credential);
            // setStatus(credential.status.toString() === "0" ? "Valid" : "Invalid");
            setStatus(credential.status.toString() === "0" ? "Valid" : "Invalid");
            setOriginalStatus(credential.status.toString() === "0" ? "Valid" : "Invalid");

            setDetailDialogOpen(true);

        } catch (err) {
            console.error("Failed to fetch credential details", err);
        }
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const columns = [
        { key: "tokenId", label: "Token ID" },
        { key: "student", label: "Student Address" },
        { key: "title", label: "Title" },
    ];

    const handleOpenWithHeader = async (url) => {
        // try {
        //     const response = await fetch(url, {
        //         headers: {
        //             "Session-Token": "your-session-token-here"
        //         }
        //     });

        //     const blob = await response.blob();
        //     const blobUrl = window.URL.createObjectURL(blob);
        //     window.open(blobUrl, "_blank");
        // } catch (err) {
        //     console.error("Failed to open with header:", err);
        // }
        console.log("Opening URL with header:", url);
        window.open(url, "_blank");
    };


    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Issued Credentials
                    <IconButton onClick={handleClose} sx={{ color: "black" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {error && <Typography color="error">{error}</Typography>}
                    <GridTable
                        columns={columns}
                        data={issuedCredentials}
                        handleClick={handleClick}
                        action="view"
                        loading={loading}
                    />
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            {/* <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} fullWidth maxWidth="sm"> */}
            {/* <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} fullScreen> */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        width: "auto", // Let width grow based on content
                        minWidth: 600, // Optional: set a reasonable minimum width
                        maxWidth: "90vw", // Optional: prevent it from growing too wide
                    },
                }}
            >

                <DialogTitle>
                    Credential Details
                    <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCredential && (
                        <>
                            <Typography variant="body1"><strong>Token ID:</strong> {selectedCredential.tokenId.toString()}</Typography>
                            {/* <Typography variant="body1"><strong>IPFS URI:</strong>
                                <Link
                                    href={selectedCredential.ipfsURI}>
                                    <a href={selectedCredential.ipfsURI} target="_blank" rel="noopener noreferrer">{selectedCredential.ipfsURI}</a>
                                </Link>
                            </Typography> */}
                            <Typography variant="body1">
                                <strong>IPFS URI:</strong>{" "}
                                <Button
                                    onClick={() => handleOpenWithHeader(selectedCredential.ipfsURI)}
                                    variant="text"
                                    sx={{
                                        p: 0,
                                        m: 0,
                                        minWidth: "unset",
                                        textTransform: "none",
                                        color: "blue",
                                        textDecoration: "underline",
                                        '&:hover': {
                                            backgroundColor: "transparent",
                                            textDecoration: "underline"
                                        }
                                    }}
                                >
                                    {selectedCredential.ipfsURI}
                                </Button>
                            </Typography>
                            <Typography variant="body1"><strong>Signer:</strong> {selectedCredential.signer}</Typography>
                            <Typography variant="body1"><strong>Signature:</strong> {selectedCredential.signature}</Typography>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={status}
                                    onChange={handleStatusChange}
                                    label="Status"
                                    disabled={originalStatus === "Invalid"}  // Disable if already Invalid
                                >
                                    <MenuItem value="Valid">Valid</MenuItem>
                                    <MenuItem value="Invalid">Invalid</MenuItem>
                                </Select>
                            </FormControl>

                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button
                        onClick={async () => {
                            if (status === "Invalid" && originalStatus === "Valid") {
                                await RevokeCredential(selectedCredential.tokenId, "Invalid status");
                            }
                            setDetailDialogOpen(false);
                        }}
                        color="primary"
                        disabled={status === originalStatus}  // Disable Save if status hasn't changed
                    >
                        Save
                    </Button>

                </DialogActions>
            </Dialog>
        </>
    );
};

FetchRecords.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
};

export default FetchRecords;
