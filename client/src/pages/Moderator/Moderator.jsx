import { useEffect, useState } from "react";
import {
    Container, TextField, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Paper, Typography
} from "@mui/material";
import {
    RegisterInstitution, RevokeInstitution, FetchInstitutions, CheckIfInstitution
} from "../../services/ContractInteraction";
import GridTable from "../../components/GridTable";
import RegistrationForm from "../../components/RegistrationForm";

const Moderator = () => {
    const [address, setAddress] = useState("");
    const [name, setName] = useState("");
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let listInstitutions = await FetchInstitutions();
            setInstitutions(listInstitutions);
        })();
    }, []);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteAddress, setDeleteAddress] = useState("");
    const [deleteReason, setDeleteReason] = useState("");

    const [checkAddress, setCheckAddress] = useState("");
    const [checkResult, setCheckResult] = useState(null);
    const [institutionNotFound, setInstitutionNotFound] = useState(false);
    const [checking, setChecking] = useState(false);

    const handleAddInstitution = async () => {
        if (!address || !name) return alert("Please enter both Address and Name");

        setLoading(true);
        try {
            await RegisterInstitution(address, name);
            let updatedInstitutions = await FetchInstitutions();
            setInstitutions(updatedInstitutions);
        } catch (error) {
            alert("Failed to add institution: " + error.message);
        }
        setLoading(false);
        setAddress("");
        setName("");
    };

    const handleDeleteClick = (address) => {
        setDeleteAddress(address);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteReason) return alert("Please enter a reason for removal");

        setLoading(true);
        try {
            await RevokeInstitution(deleteAddress, deleteReason);
            let updatedInstitutions = await FetchInstitutions();
            setInstitutions(updatedInstitutions);
        } catch (error) {
            alert("Failed to remove institution: " + error.message);
        }
        setLoading(false);
        setDeleteDialogOpen(false);
        setDeleteReason("");
    };

    const handleCheckInstitution = async () => {
        if (!checkAddress) return;

        setChecking(true);
        const result = await CheckIfInstitution(checkAddress);
        setCheckResult(result.exists ? result : null);
        setInstitutionNotFound(!result.exists)
        setChecking(false);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <RegistrationForm
                address={address}
                setAddress={setAddress}
                name={name}
                setName={setName}
                handleSubmit={handleAddInstitution}
                loading={loading}
                label="Institution"
            />

            {
                institutions.length ? (
                    <GridTable
                        columns={[{ key: "address", label: "Address" }, { key: "name", label: "Name" }]}
                        data={institutions}
                        handleDeleteClick={handleDeleteClick}
                        loading={loading}
                    />
                ) : (
                    <h1>No institutions to List</h1>
                )
            }

            {/* Check Institution Existence */}
            <Paper sx={{ p: 2, mt: 4, display: "flex", gap: 2, alignItems: "center" }}>
                {/* <h3>Check Institution</h3> */}
                <TextField
                    label="Institution Address"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={checkAddress}
                    onChange={(e) => setCheckAddress(() => {
                        setCheckResult(null)
                        setInstitutionNotFound(false)
                        return e.target.value
                    })}
                    disabled={checking}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckInstitution}
                    disabled={checking}
                >
                    {checking ? "Checking..." : "Check Institution"}
                </Button>
            </Paper>

            {/* Show Institution Found */}
            {checkResult && checkResult.exists && (
                <Paper sx={{ p: 2, mt: 2, display: "block" }}>
                    <Typography variant="h6">Institution Found</Typography>
                    <Typography><b>Address:</b> {checkAddress}</Typography>
                    <Typography><b>Name:</b> {checkResult.name}</Typography>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => handleDeleteClick(checkAddress)}
                    >
                        Remove Institution
                    </Button>
                </Paper>
            )}

            {/* Show Institution Not Found */}
            {institutionNotFound && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: "error.main", color: "white", display: "block" }}>
                    <Typography variant="h6">No Institution Found</Typography>
                    <Typography>The entered address is not a registered institution.</Typography>
                </Paper>
            )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Remove Institution</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Reason for Removal"
                        variant="outlined"
                        fullWidth
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
                    <Button color="error" onClick={handleConfirmDelete} disabled={loading}>
                        {loading ? "Removing..." : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Moderator;
