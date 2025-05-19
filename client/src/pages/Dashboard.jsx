import { Container, Typography, Button, Box, Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const Dashboard = ({ userRole }) => {
    const navigate = useNavigate();
    const pages = {
        "ADMIN": { label: "Admin", path: "/admin" },
        "MODERATOR": { label: "Moderator", path: "/moderator" },
        "INSTITUTION": { label: "Institution", path: "/institution" },
        "USER": { label: "User", path: "/user" },
        "Request": { label: "Request Dashboard", path: "/requests" },
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 10, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Welcome, {userRole}. Choose a section to continue.
                </Typography>
                <Grid2 container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                    <Grid2>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate(pages[userRole].path)}
                        >
                            {pages[userRole].label}
                        </Button>
                    </Grid2>
                    {
                        (userRole != "USER") &&
                        <Grid2>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                onClick={() => navigate(pages["USER"].path)}
                            >
                                {pages["USER"].label}
                            </Button>
                        </Grid2>
                    }
                    <Grid2>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate(pages["Request"].path)}
                        >
                            {pages["Request"].label}
                        </Button>
                    </Grid2>
                </Grid2>
            </Box>
        </Container>
    );
};

Dashboard.propTypes = {
    userRole: PropTypes.string.isRequired,
};

export default Dashboard;