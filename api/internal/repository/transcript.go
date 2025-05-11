package repository

type TranscriptInput struct {
	TranscriptID     string `json:"transcript_id" binding:"required"`       // Unique identifier for the transcript
	IPFSURIMetadata  string `json:"ipfs_uri_metadata" binding:"required"`   // IPFS URI for metadata
	IPFSURIMediaHash string `json:"ipfs_uri_media_hash" binding:"required"` // IPFS hash for media content
	OwnerWallet      string `json:"owner_wallet" binding:"required"`        // Wallet address of the transcript owner
}
