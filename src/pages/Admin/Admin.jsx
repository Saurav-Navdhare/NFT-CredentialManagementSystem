import { useEffect, useState } from "react";
import {
    Container, TextField, Button, Dialog, DialogActions,
    DialogContent, DialogTitle
} from "@mui/material";
import { RegisterModerator, RevokeModerator, FetchModerators } from "../../services/ContractInteraction";
import GridTable from "../../components/GridTable";
import RegistrationForm from "../../components/RegistrationForm";

const Admin = () => {
    const [address, setAddress] = useState("");
    const [name, setName] = useState("");
    const [moderators, setModerators] = useState([]);
    const [loading, setLoading] = useState(false);

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
            await RegisterModerator(address, name);  // Wait for transaction success
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
            await RevokeModerator(deleteAddress, deleteReason);  // Wait for transaction success
            let updatedModerators = await FetchModerators();
            setModerators(updatedModerators);
        } catch (error) {
            alert("Failed to remove moderator: " + error.message);
        }
        setLoading(false);
        setDeleteDialogOpen(false);
        setDeleteReason("");
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <RegistrationForm
                address={address}
                setAddress={setAddress}
                name={name}
                setName={setName}
                handleSubmit={handleAddModerator}
                loading={loading}
                label="Moderator"
            />

            {
                moderators.length ? (
                    <GridTable
                        columns={[{ key: "address", label: "Address" }, { key: "name", label: "Name" }]}
                        data={moderators}
                        handleDeleteClick={handleDeleteClick}
                        loading={loading}
                    />
                ) : (
                    <h1>No moderators to List</h1>
                )
            }

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
