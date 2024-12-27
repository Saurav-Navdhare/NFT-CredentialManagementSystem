import { useCallback, useState } from 'react'
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone'
import DisplayMedia from './utils/DisplayMedia'
import ClearIcon from '@mui/icons-material/Clear';
import { Typography, TextField, Button } from '@mui/material';
import { Bars } from 'react-loader-spinner';
import uploadToIPFS from "./utils/uploadToIPFS"
import fetchAndHash from './utils/fetchAndHash';

export default function UploadMedia({ classNames }) {
    UploadMedia.propTypes = {
        classNames: PropTypes.string,
    };
    const [file, setFile] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [studentAddress, setStudentAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [ipfsURI, setIpfsURI] = useState('');
    const [fileHash, setFileHash] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length !== 0) {
            setFile(Object.assign(acceptedFiles[0], { preview: URL.createObjectURL(acceptedFiles[0]) }));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
            "application/pdf": []
        },
        disabled // Disable file drop when `disabled` is true
    });

    const handleClear = () => {
        setFile([]);
        setIpfsURI('');
        setFileHash('');
        setSuccess(false);
    };

    const isBlockchainAddressValid = (address) => {
        const regex = /^0x[a-fA-F0-9]{40}$/;
        return regex.test(address);
    };

    const handleSubmit = async () => {
        if (isBlockchainAddressValid(studentAddress) && file.length !== 0) {
            setError('');
            setSuccess(false);
            setDisabled(true); // Disable fields and button

            try {
                const response = await uploadToIPFS(file);
                console.log(response);
                if (response.error != null) {
                    throw new Error(response.error);
                }
                setIpfsURI(response.ipfsUrl);

                const res = await fetchAndHash(response.ipfsUrl);
                if (res.error != null) {
                    throw new Error(res.error);
                }
                setFileHash(res.hash);
                setSuccess(true);
            } catch (error) {
                console.error(error);
            } finally {
                setDisabled(false); // Enable fields and button
            }
        } else {
            setError('Invalid blockchain address. Ensure it starts with 0x and is 42 characters long.');
            setSuccess(false);
        }
    };

    return (
        <div>
            {
                disabled && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <Bars
                            height="80"
                            width="80"
                            color="#4fa94d"
                            ariaLabel="bars-loading"
                            visible={true}
                        />
                    </div>
                )
            }
            <div className="mt-10 flex flex-row justify-evenly items-center border-2 border-dashed border-[#93B7BE] rounded-lg">
                <div className="h-[650px] w-[500px] flex justify-center items-center">
                    {file.length !== 0 ? (
                        <div className="relative flex justify-center items-center">
                            <ClearIcon
                                onClick={!disabled ? handleClear : undefined}
                                className="absolute top-0 right-0 cursor-pointer z-10"
                                style={{ color: 'red', top: '-20px', right: '-20px' }}
                            />
                            <DisplayMedia url={file.preview} className="right-2" />
                        </div>
                    ) : (
                        <div
                            {...getRootProps({
                                className: `${classNames} flex justify-center items-center border-2 border-dashed border-[#93B7BE] rounded-lg border upload-container`,
                            })}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the files here ...</p>
                            ) : (
                                <p>Drag and drop some files here, or click to select files</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="w-[5px] h-[600px] bg-[#ffffff]" />
                <div>
                    <div className="flex flex-col justify-center items-center h-[600px] w-[500px]">
                        <TextField
                            label="Student Address"
                            variant="outlined"
                            value={studentAddress}
                            onChange={(e) => {
                                setError('');
                                setStudentAddress(e.target.value);
                            }}
                            error={Boolean(error)}
                            helperText={error}
                            minLength={42}
                            maxLength={42}
                            color="secondary"
                            sx={{
                                "width": "400px",
                                "marginBottom": '20px',
                                '& .MuiInputLabel-root': {
                                    color: 'primary.main',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'primary.main',
                                },
                                '& .MuiOutlinedInput-root': {
                                    color: '#A64D79',
                                },
                                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'secondary.light',
                                },
                            }}
                            disabled={disabled} // Disable text field
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            sx={{ marginBottom: '10px' }}
                            disabled={disabled} // Disable button
                        >
                            Submit
                        </Button>
                        {success && (
                            <>
                                <Typography sx={{ color: 'secondary.light', marginY: '10px' }}>
                                    Address is valid!
                                </Typography>

                                <Typography sx={{ color: 'secondary.light', marginY: '10px' }}>
                                    IPFS URI of the file: <a href={ipfsURI} target="_blank" rel="noopener noreferrer">{ipfsURI}</a>
                                </Typography>

                                <Typography sx={{ color: 'secondary.light', marginY: '10px' }}>
                                    FILE HASH: {fileHash}
                                </Typography>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
