import { useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography
} from "@mui/material";
import {
  GetAccessRequests, RaiseAccessRequest,
  // FetchAccessTranscript,
  GetRequestStatus
} from "../../services/ContractInteraction";
import GridTable from "../../components/GridTable";
import AccessApproval from "../../components/AccessApproval";
import dayjs from "dayjs"; // Install via `npm install dayjs`


const Request = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [studentAddress, setStudentAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [raiseError, setRaiseError] = useState("");
  const [raiseSuccessMessage, setRaiseSuccessMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [viewType, setViewType] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRequestRow, setSelectedRequestRow] = useState(null);
  const [approvedTranscripts, setApprovedTranscripts] = useState([]);

  const [requestStatusDetails, setRequestStatusDetails] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);



  const clearView = () => {
    setViewType(null);
    setRequests([]);
    setApprovedTranscripts([]);
    setShowGrid(false);
    setColumns(null);
    setGridData(null);
    setLoading(false);
    setRaiseError("");
    setSelectedRequestRow(null);
  };

  const handleRaiseRequest = async () => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(studentAddress)) {
      setRaiseError("Invalid student blockchain address");
      return;
    }
    const trimmedPurpose = purpose.trim();
    if (trimmedPurpose === "") {
      setRaiseError("Purpose is required");
      return;
    }

    const body = {
      student_wallet: studentAddress,
      description: trimmedPurpose,
      expiry_minutes: 10080
    };

    const response = await RaiseAccessRequest(body);
    if (response === null) {
      setRaiseError("Failed to raise request");
      return;
    }

    setRaiseSuccessMessage(response.message);
    setStudentAddress("");
    setPurpose("");
  };

const fetchRequests = async (req_type = "sent") => {
  clearView();
  setLoading(true);
  let data = await GetAccessRequests(
    req_type === "received" ? "student_wallet" : "recipient_wallet"
  );
  setLoading(false);

  if (!data?.requests?.length) {
    setRaiseError("No requests found");
    return;
  }

  const formattedData = data.requests.map((req) => {
    const expiryDate = new Date(req.expiry_timestamp);

    return {
      ...req,
      formatted_expiry: dayjs(expiryDate).format("MMM D, YYYY, h:mm A"),
      isExpired : expiryDate < new Date(),
      isPending: req.status.toLowerCase() === "pending"
    };
  });

  setViewType(req_type);
  setRequests(formattedData);
  setRaiseError("");

  setColumns([
    { key: "request_id", label: "Request ID" },
    { key: "description", label: "Description" },
    { key: "student_wallet", label: "Student Wallet" },
    { key: "recipient_wallet", label: "Recipient Wallet" },
    { key: "status", label: "Status" },
    { key: "formatted_expiry", label: "Expiry" },
  ]);

  setGridData(formattedData);
  setShowGrid(true);
};


  // const fetchApprovedTranscripts = async () => {
  //   const res = await FetchAccessTranscript();
  //   setApprovedTranscripts(res);
  // };

  const handleGridActionClick = async (row) => {
    const isSentRequest = viewType === "sent";
    const isReceivedRequest = viewType === "received";
  
    const canAct =
      (isSentRequest && row.status.toLowerCase() !== "pending") ||
      (isReceivedRequest && !row.isExpired);
  
    if (!canAct) return;
  
    if (isSentRequest && row.status.toLowerCase() !== "pending") {
      try {
        const statusDetails = await GetRequestStatus(row.request_id, viewType);
        console.log("Request Status Details:", statusDetails);
        setRequestStatusDetails(statusDetails);
        setShowStatusDialog(true);
      } catch (error) {
        console.error("Error fetching request status:", error);
      }
      return; // Don't show approval dialog in this case
    }
    if(isReceivedRequest && row.status.toLowerCase() !== "pending") {
      try {
        const statusDetails = await GetRequestStatus(row.request_id, viewType);
        console.log("Request Status Details:", statusDetails);
        setRequestStatusDetails(statusDetails);
        setShowStatusDialog(true);
      } catch (error) {
        console.error("Error fetching request status:", error);
      }
      return; // Don't show approval dialog in this case
    }
  
    setSelectedRequestRow(row);
    setShowApprovalDialog(true);
  };



  return (
    <Box className="p-4" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Typography variant="h4" gutterBottom>
        Access Request Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          setOpenDialog(true);
          setRaiseSuccessMessage("");
          setRaiseError("");
        }}
      >
        Raise Access Request
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Raise Access Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Student Address"
            fullWidth
            margin="normal"
            value={studentAddress}
            onChange={(e) => {
              setStudentAddress(e.target.value);
              setRaiseError("");
            }}
          />
          <TextField
            label="Purpose"
            fullWidth
            margin="normal"
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setRaiseError("");
            }}
          />
        </DialogContent>
        {raiseSuccessMessage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
            <Typography
              color="success"
              sx={{
                backgroundColor: "#e8f5e9",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              {raiseSuccessMessage}
            </Typography>
          </Box>
        )}
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {!raiseSuccessMessage && (
            <Button onClick={handleRaiseRequest} variant="contained">
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Box className="mt-4 flex gap-4 flex-wrap justify-center">
        <Button variant="outlined" onClick={() => fetchRequests()}>
          View Raised Requests
        </Button>
        <Button variant="outlined" onClick={() => fetchRequests("received")}>
          View Received Requests
        </Button>
        {/* <Button variant="outlined" onClick={fetchApprovedTranscripts}>
          View Approved Transcripts
        </Button> */}
        <Button variant="text" color="error" onClick={clearView}>
          Clear View
        </Button>
      </Box>

      {raiseError && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography
            color="error"
            sx={{
              backgroundColor: "#fdecea",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {raiseError}
          </Typography>
        </Box>
      )}

      {showGrid && (
        <GridTable
          columns={columns}
          data={gridData}
          handleClick={handleGridActionClick}
          loading={loading}
          action="Launch"
          passRow={true}
          style={{ width: "100%", marginTop: "20px" }}
        />
      )}

      <Dialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Respond to Access Request</DialogTitle>
        <DialogContent>
          {selectedRequestRow && (
            <AccessApproval
              data={selectedRequestRow}
              onClose={() => setShowApprovalDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
  open={showStatusDialog}
  onClose={() => setShowStatusDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Request Status Details</DialogTitle>
  <DialogContent dividers>
    {requestStatusDetails && (
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography><strong>Request ID:</strong> {requestStatusDetails.request_id}</Typography>
        <Typography><strong>Status:</strong> {requestStatusDetails.status}</Typography>
        <Typography><strong>Description:</strong> {requestStatusDetails.description}</Typography>
        <Typography><strong>Student Wallet:</strong> {requestStatusDetails.student_wallet}</Typography>
        <Typography><strong>Recipient Wallet:</strong> {requestStatusDetails.recipient_wallet}</Typography>
        <Typography><strong>Expiry:</strong> {dayjs(requestStatusDetails.expiry_timestamp).format("MMM D, YYYY, h:mm A")}</Typography>

        {requestStatusDetails.status.toLowerCase() === "approved" && requestStatusDetails.transcripts?.length > 0 && (
          <>
            <Typography variant="h6" mt={2}>Transcripts</Typography>
            <GridTable
              columns={[
                { key: "transcript_id", label: "Transcript ID" },
                { key: "ipfs_uri_file", label: "File Link" },
                { key: "ipfs_uri_metadata", label: "Metadata Link" },
              ]}
              data={requestStatusDetails.transcripts.map((t) => ({
                ...t,
                ipfs_uri_file: (
                  <a href={t.ipfs_uri_file} target="_blank" rel="noopener noreferrer">
                    Open File
                  </a>
                ),
                ipfs_uri_metadata: (
                  <a href={t.ipfs_uri_metadata} target="_blank" rel="noopener noreferrer">
                    Open Metadata
                  </a>
                ),
              }))}
              handleClick={null}
              loading={false}
            />
          </>
        )}

        {requestStatusDetails.status.toLowerCase() === "denied" && requestStatusDetails.reason && (
          <Typography color="error"><strong>Rejection Reason:</strong> {requestStatusDetails.reason}</Typography>
        )}
      </Box>
    )}
  </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>


      {approvedTranscripts.length > 0 && (
        <Box className="mt-4">
          <Typography variant="h6">Approved Transcripts</Typography>
          <ul>
            {approvedTranscripts.map((t) => (
              <li key={t.tokenId}>{t.tokenId} - {t.title}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default Request;
