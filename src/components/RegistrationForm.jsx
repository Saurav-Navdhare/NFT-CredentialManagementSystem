import { Paper, TextField, Button } from "@mui/material";
import PropTypes from 'prop-types';

const RegistrationForm = ({ address, setAddress, name, setName, handleSubmit, loading, label }) => {
    return (
        <Paper sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
                label="Address"
                variant="outlined"
                size="small"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
            />
            <TextField
                label="Name"
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Adding..." : `Add ${label}`}
            </Button>
        </Paper>
    );
};
RegistrationForm.propTypes = {
    address: PropTypes.string.isRequired,
    setAddress: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired
};

export default RegistrationForm;