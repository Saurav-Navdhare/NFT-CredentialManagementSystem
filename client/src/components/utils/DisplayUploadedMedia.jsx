import { useState } from 'react';
import { TextField, Button, Typography, IconButton, Tooltip } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import axios from 'axios';

export default function DisplayUploadedMedia() {
    const [ipfsURI, setIpfsURI] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMetadata = async () => {
        setLoading(true);
        setMetadata(null);
        setError('');

        try {
            const sessionToken = "dskhfgidsg" //localStorage.getItem('sessionToken'); // or pull from cookie

            const response = await axios.get(ipfsURI, {
                headers: {
                    'Session-Token': sessionToken,
                },
            });

            setMetadata(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch metadata');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex flex-col items-center gap-4">
            <TextField
                label="IPFS URI"
                value={ipfsURI}
                onChange={(e) => setIpfsURI(e.target.value)}
                sx={{ width: '500px' }}
            />
            <Button variant="contained" onClick={fetchMetadata} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Credential'}
            </Button>

            {error && <Typography color="error">{error}</Typography>}

            {metadata && (
                <div className="mt-6 p-4 border rounded-xl shadow-md w-[600px]">
                    <Typography variant="h6" gutterBottom>Credential Details</Typography>
                    <Typography><strong>Title:</strong> {metadata.title}</Typography>
                    <Typography><strong>Institution:</strong> {metadata.institution}</Typography>
                    <Typography><strong>File Hash:</strong> {metadata.fileHash}</Typography>
                    <Typography><strong>IPFS URI:</strong> {metadata.ipfsURI}</Typography>
                    <Typography><strong>Signature:</strong> {metadata.signature}</Typography>

                    {metadata.ipfsURI && (
                        <Tooltip title="View media">
                            <IconButton
                                onClick={() => window.open(metadata.ipfsURI, '_blank')}
                                aria-label="open"
                            >
                                <LaunchIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            )}
        </div>
    );
}
