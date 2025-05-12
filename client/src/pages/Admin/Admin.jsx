import { useEffect, useState } from "react";
import {
    Container, TextField, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Paper, Typography
} from "@mui/material";
import { RegisterModerator, RevokeModerator, FetchModerators, CheckIfModerator } from "../../services/ContractInteraction";
import GridTable from "../../components/GridTable";
import RegistrationForm from "../../components/RegistrationForm";

const Admin = () => {
    const [address, setAddress] = useState("");
    const [name, setName] = useState("");
    const [moderators, setModerators] = useState([]);
    const [loading, setLoading] = useState(false);

    const [checkAddress, setCheckAddress] = useState("");
    const [foundModerator, setFoundModerator] = useState(null);
    const [moderatorNotFound, setModeratorNotFound] = useState(false);

    useEffect(() => {
        (async () => {
            let listModerators = await FetchModerators();
            setModerators(listModerators);
        })();
    }, []);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteAddress, setDeleteAddress] = useState("");
    const [deleteReason, setDeleteReason] = useState("");

    const handleAddModerator = async () => {
        if (!address || !name) return alert("Please enter both Address and Name");

        setLoading(true);
        try {
            await RegisterModerator(address, name);
            let updatedModerators = await FetchModerators();
            setModerators(updatedModerators);
        } catch (error) {
            alert("Failed to add moderator: " + error.message);
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
            await RevokeModerator(deleteAddress, deleteReason);
            let updatedModerators = await FetchModerators();
            setModerators(updatedModerators);
        } catch (error) {
            alert("Failed to remove moderator: " + error.message);
        }
        setLoading(false);
        setDeleteDialogOpen(false);
        setDeleteReason("");
    };

    const handleCheckModerator = async () => {
        setLoading(true);
        setFoundModerator(null);
        setModeratorNotFound(false);

        const result = await CheckIfModerator(checkAddress);

        if (result.exists) {
            setFoundModerator({ address: checkAddress, name: result.name });
        } else {
            setModeratorNotFound(true);
        }

        setLoading(false);
    };



    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            {/* Add Moderator Form */}
            <RegistrationForm
                address={address}
                setAddress={setAddress}
                name={name}
                setName={setName}
                handleSubmit={handleAddModerator}
                loading={loading}
                label="Moderator"
            />

            {/* Moderator List */}
            {moderators.length ? (
                <GridTable
                    columns={[{ key: "address", label: "Address" }, { key: "name", label: "Name" }]}
                    data={moderators}
                    handleClick={handleDeleteClick}
                    loading={loading}
                />
            ) : (
                <h1>No moderators to List</h1>
            )}

            {/* Check Moderator Form */}
            <Paper sx={{ p: 2, mt: 4, display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                    label="Enter Address to Check"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={checkAddress}
                    onChange={(e) => setCheckAddress(e.target.value)}
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckModerator}
                    disabled={loading}
                >
                    Check Moderator
                </Button>
            </Paper>

            {/* Show Moderator Found */}
            {foundModerator && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6">Moderator Found</Typography>
                    <Typography><b>Address:</b> {foundModerator.address}</Typography>
                    <Typography><b>Name:</b> {foundModerator.name}</Typography>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => handleDeleteClick(foundModerator.address)}
                    >
                        Remove Moderator
                    </Button>
                </Paper>
            )}

            {/* Show Moderator Not Found */}
            {moderatorNotFound && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: "error.main", color: "white" }}>
                    <Typography variant="h6">No Moderator Found</Typography>
                    <Typography>The entered address is not a moderator.</Typography>
                </Paper>
            )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Remove Moderator</DialogTitle>
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

export default Admin;
