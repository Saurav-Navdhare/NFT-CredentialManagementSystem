import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GridTable from "./GridTable";
import { FetchInstitutionCredentials, FetchCredentialByTokenId, FetchStudentCredentials } from "../services/ContractInteraction";
import PropTypes from "prop-types";
import CredentialInfo from "./utils/CredentialInfo";
const FetchRecords = ({ open, handleClose, client="institute" }) => {
    const [issuedCredentials, setIssuedCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // For detail view dialog
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    

    useEffect(() => {
        const fetchIssuedCredentials = async () => {
            setLoading(true);
            try {
                let credentials = [];
                if(client === "institute") {
                    credentials = await FetchInstitutionCredentials();
                }
                else {
                    credentials = await FetchStudentCredentials();
                }
                credentials = credentials.map((credential) => ({
                    tokenId: credential.tokenId,
                    student: credential.student,
                    title: credential.title,
                    id: credential.tokenId,
                }));
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
    }, [open, client]);

    // Handle row click
    const handleClick = async (row) => {
        try {
            let credential = await FetchCredentialByTokenId(row, client);
            if(credential == null){
                client === "institute" ? setError("Credential not found Or you are not signer of this credential") : setError("Credential not found Or you are not owner of this credential");
                return;
            }
            else {
                setSelectedCredential(credential);
                setDetailDialogOpen(true);
            }

        } catch (err) {
            console.error("Failed to fetch credential details", err);
        }
    };

    const columns = [
        { key: "tokenId", label: "Token ID" },
        { key: "student", label: "Student Address" },
        { key: "title", label: "Title" },
    ];

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: "85vw",
                        maxWidth: "none",
                        height: "66.666vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "auto",
                    },
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Issued Credentials
                    <IconButton onClick={handleClose} sx={{
                            color: "black",
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ flex: 1, width: "100%" }}>
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

            {detailDialogOpen && (
                <CredentialInfo
                    detailDialogOpen={detailDialogOpen}
                    setDetailDialogOpen={setDetailDialogOpen}
                    credential={selectedCredential}
                    client={client}
                />
            )}
        </>
    );
};

FetchRecords.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    client: PropTypes.string,
};

export default FetchRecords;
