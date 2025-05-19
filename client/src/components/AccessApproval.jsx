import { useState } from 'react';
import PropTypes from 'prop-types';
import {
Box, Table, TableBody, TableCell, TableContainer, TableRow,
Typography, Radio, RadioGroup, FormControlLabel, TextField,
FormControl, FormLabel, Checkbox, FormGroup, IconButton, Button
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { FetchStudentCredentials, FetchCredentialByTokenId, SubmitResponse } from '../services/ContractInteraction';
import {
    Dialog, DialogTitle, DialogContent, DialogActions
  } from '@mui/material';
// import { Drawer } from '@mui/material';
import config from "../config"
  
import { useEffect } from 'react';
import axios from 'axios';
import CredentialInfo from './utils/CredentialInfo';


const AccessApproval = ({ data, onClose }) => {

    const [credentials, setCredentials] = useState([]);

    
    
    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const credentials = await FetchStudentCredentials(data.student_wallet);
                console.log("Fetched credentials:", credentials);
                // Process the credentials as needed
                setCredentials(credentials);
            } catch (error) {
                console.error("Error fetching credentials:", error);
            }
        };
        fetchCredentials();
    }, [data.student_wallet]);

    
    // const [openJsonDialog, setOpenJsonDialog] = useState(false);
    const [selectedTokenIdForJson, setSelectedTokenIdForJson] = useState(null);
    const [jsonData, setJsonData] = useState(null);

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState(null);
    

    const [decision, setDecision] = useState('');
    const [reason, setReason] = useState('');
    const [selectedTokenIds, setSelectedTokenIds] = useState([]);


    const fetchIpfsJson = async (ipfsUri, tokenId) => {
        try {
            console.log("ipfsUri", ipfsUri)
            const response = await axios.get(ipfsUri, {
                headers: {
                  'Accept': 'application/json'
                }
              });
              console.log('Fetched JSON:', response.data);
              const json = response.data;
              setJsonData(json);
              setSelectedTokenIdForJson(tokenId);
              return json;
          } catch (error) {
              console.error("Error fetching JSON from IPFS:", error);
          }
      };


    const handleCheckboxChange = (tokenId) => {
        setSelectedTokenIds(prev =>
        prev.includes(tokenId)
            ? prev.filter(id => id !== tokenId)
            : [...prev, tokenId]
        );
    };

    const handleSubmit = async() => {
        if (decision === 'reject' && !reason.trim()) {
            alert("Please enter a reason for rejection.");
            return;
        }
        if (decision === 'approve' && selectedTokenIds.length === 0) {
            alert("Please select at least one credential to approve.");
            return;
        }

        const payload = {
            request_id: data.request_id,
            response: decision === 'approve' ? "accept" : "reject",
            transcript_list: decision === 'approve' ? selectedTokenIds : [],
            reason: decision === 'reject' ? reason : ''
        };
        console.log("Payload for submission:", payload);
        const response = await SubmitResponse(payload)
        console.log(response.data);

        onClose(false); // Close dialog after submission
        // Call contract or API here with `payload`
    };

    return (
        <>
        <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Access Request Details</Typography>
        <TableContainer>
            <Table>
            <TableBody>
                <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>{data.request_id}</TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Student Wallet</TableCell>
                <TableCell>{data.student_wallet}</TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Recipient Wallet</TableCell>
                <TableCell>{data.recipient_wallet}</TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{data.status}</TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Expiry</TableCell>
                <TableCell>{data.expiry_timestamp}</TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </TableContainer>

        {data.status === 'pending' && (
            <>
            <FormControl component="fieldset" sx={{ mt: 4 }}>
                <FormLabel component="legend">Your Decision</FormLabel>
                <RadioGroup row value={decision} onChange={(e) => setDecision(e.target.value)}>
                <FormControlLabel value="approve" control={<Radio />} label="Approve" />
                <FormControlLabel value="reject" control={<Radio />} label="Reject" />
                </RadioGroup>
            </FormControl>

            {decision === 'reject' && (
                <TextField
                label="Reason for Rejection"
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2 }}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                />
            )}

            {decision === 'approve' && (
                <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Select Credentials to Share:</Typography>
                <FormGroup>
                    {credentials.map((cred) => (
                    <Box key={cred.tokenId} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel
                        control={
                            <Checkbox
                            checked={selectedTokenIds.includes(cred.tokenId)}
                            onChange={() => handleCheckboxChange(cred.tokenId)}
                            />
                        }
                        label={`${cred.tokenId} - ${cred.title}`}
                        />
                        <IconButton
                            onClick={async () => {
                                try {
                                const result = await FetchCredentialByTokenId(cred.tokenId, 'user');
                                console.log("Fetched credential by token ID:", result);
                                if (result.ipfsURI) {
                                    await fetchIpfsJson(result.ipfsURI, cred.tokenId); // optional: if you want to preload
                                    setSelectedCredential({ ...result, tokenId: cred.tokenId });
                                    setDetailDialogOpen(true);
                                } else {
                                    console.error("No IPFS URI found in credential");
                                }
                                } catch (error) {
                                console.error("Error fetching credential by token ID:", error);
                                }
                            }}
                            >
                            <LaunchIcon />
                            </IconButton>


                    </Box>
                    ))}

                </FormGroup>
                </Box>
            )}
            <CredentialInfo
                detailDialogOpen={detailDialogOpen}
                setDetailDialogOpen={setDetailDialogOpen}
                credential={selectedCredential}
                client="user" // or "institute" depending on context
                />


            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
                </Button>
                <Button variant="outlined" color="error" onClick={() => onClose(false)}>
                Cancel
                </Button>
            </Box>
            </>
        )}

        </Box>
        </>
    );
    };

    AccessApproval.propTypes = {
    data: PropTypes.shape({
        request_id: PropTypes.string.isRequired,
        student_wallet: PropTypes.string.isRequired,
        recipient_wallet: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        expiry_timestamp: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    };

    export default AccessApproval;
