import {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import { RevokeCredential, FetchCredentialByTokenId } from '../../services/ContractInteraction'; // Adjust the import path as necessary
import axios from 'axios';
import { Box, Table, TableBody, TableCell, TableRow, Link } from '@mui/material';

const CredentialInfo = ({ detailDialogOpen, setDetailDialogOpen, credential, client }) => {

    const [status, setStatus] = useState();
    const [originalStatus, setOriginalStatus] = useState();
    const [jsonData, setJsonData] = useState(null);

    const keyLabelMap = {
        title: 'Title',
        institution: 'Institution',
        fileHash: 'File Hash',
        ipfsURI: 'IPFS URI',
        // signature: 'Signature',
        dateOfIssuance: 'Date of Issuance'
      };
      


    useEffect(() => {
        if (!credential) return;

        if (client === "institute") {
            const statusValue = credential.status === "0" ? "Valid" : "Invalid";
            setStatus(statusValue);
            setOriginalStatus(statusValue);
        } else {
            const fetchStatus = async () => {
                if (credential && credential.tokenId) {
                    const fetchedCredential = await FetchCredentialByTokenId(credential.tokenId);
                    const statusValue = fetchedCredential?.status === "0" ? "Valid" : "Invalid";
                    setStatus(statusValue);
                    setOriginalStatus(statusValue);
                }
            };
            fetchStatus();
        }
        const fetchIpfsJson = async (ipfsUri) => {
        try {
            const response = await axios.get(ipfsUri, {
                headers: {
                    'Accept': 'application/json'
                }
                });
                const json = response.data;
                if (json.signature) {
                    delete json.signature;
                }
                setJsonData(json);
                return json;
            } catch (error) {
                console.error("Error fetching JSON from IPFS:", error);
            }
        };
        fetchIpfsJson(credential.ipfsURI, credential.tokenId);
    }, [credential, client]);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleOpenWithHeader = async (url) => {
        window.open(url, "_blank");
    };

  return (
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
            {credential && (
                <>
                    <Typography variant="body1"><strong>Token ID:</strong> {credential.tokenId.toString()}</Typography>
                    <Typography variant="body1">
                        <strong>Metadata IPFS URI:</strong>{" "}
                        <Button
                            onClick={() => handleOpenWithHeader(credential.ipfsURI)}
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
                            {credential.ipfsURI}
                        </Button>
                    </Typography>
                    <Typography variant="body1"><strong>Signer:</strong> {credential.signer}</Typography>
                    <Typography variant="body1"><strong>Signature:</strong>{credential.signature}</Typography>
                    {client === "institute" ? (<FormControl fullWidth margin="normal">
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
                ):
                    (<Typography variant="body1"><strong>Status:</strong> {status}</Typography>)
                }

                </>
            )}
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setDetailDialogOpen(false)} color="secondary">{client==='institute' ? 'Cancel' : 'Close'}</Button>
            {client === "institute" && (
                <>
                    <Button
                        onClick={async () => {
                            if (status === "Invalid" && originalStatus === "Valid") {
                                await RevokeCredential(credential.tokenId, "Invalid status");
                            }
                            setDetailDialogOpen(false);
                        }}
                        color="primary"
                        disabled={status === originalStatus}  // Disable Save if status hasn't changed
                    >
                        Save
                    </Button>
                </>
            )}
            

        </DialogActions>
        {jsonData && (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Credential JSON Details</Typography>
            <Table size="small">
            <TableBody>
                {Object.entries(jsonData).map(([key, value]) => (
                <TableRow key={key}>
                    {/* <TableCell>{key}</TableCell> */}
                    <TableCell>{keyLabelMap[key] || key}</TableCell>
                    <TableCell>
                    {typeof value === 'string' && value.startsWith('http') ? (
                        <Link href={value} target="_blank" rel="noopener">{value}</Link>
                    ) : (
                        value.toString()
                    )}
                    </TableCell>
                </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
)}

    </Dialog>
  )
}
CredentialInfo.propTypes = {
    detailDialogOpen: PropTypes.bool.isRequired,
    setDetailDialogOpen: PropTypes.func.isRequired,
    credential: PropTypes.shape({
        tokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ipfsURI: PropTypes.string,
        signer: PropTypes.string,
        signature: PropTypes.string,
        status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    client: PropTypes.string.isRequired,
};

export default CredentialInfo