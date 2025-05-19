package utils

import (
	"api/internal/models"
	"gorm.io/gorm"
)

func CreateRequestEntry(db *gorm.DB, request models.Request) (models.Request, error) {
	if err := db.Create(&request).Error; err != nil {
		return request, err
	}
	return request, nil
}

func GetApprovedTranscripts(db *gorm.DB, recipientWallet string) ([]string, error) {
	var transcriptIDs []string

	err := db.Table("request_transcripts").
		Select("request_transcripts.transcript_id").
		Joins("JOIN requests ON requests.id = request_transcripts.request_id").
		Where("requests.recipient_wallet = ? AND requests.status = ?", recipientWallet, models.Approved).
		Pluck("request_transcripts.transcript_id", &transcriptIDs).Error

	return transcriptIDs, err
}

func GetRequestsForStudent(db *gorm.DB, studentWallet string) ([]models.Request, error) {
	var requests []models.Request
	err := db.Where("student_wallet = ?", studentWallet).Find(&requests).Error
	return requests, err
}

func CreateTranscriptEntry(db *gorm.DB, transcript models.Transcript) (models.Transcript, error) {
	if err := db.Create(&transcript).Error; err != nil {

		return transcript, err
	}
	return transcript, nil
}

//func GetApprovedTranscript(db *gorm.DB, walletAddress string) ([]string, error) {
//	var transcriptIDs []string
//
//	// 1. Transcripts directly owned
//	var owned []string
//	if err := db.Model(&models.Transcript{}).
//		Select("transcript_id").
//		Where("owner_wallet = ?", walletAddress).
//		Scan(&owned).Error; err != nil {
//		return nil, err
//	}
//	fmt.Println(owned)
//	// 2. Transcripts from approved requests
//	var approved []string
//	if err := db.Model(&models.RequestTranscript{}).
//		Select("transcript_id").
//		Joins("JOIN requests ON requests.id = request_transcripts.request_id").
//		Where("requests.recipient_wallet = ? AND requests.status = ?", walletAddress, models.Approved).
//		Scan(&approved).Error; err != nil {
//		return nil, err
//	}
//
//	// Deduplicate
//	idMap := make(map[string]struct{})
//	for _, id := range owned {
//		idMap[id] = struct{}{}
//	}
//	for _, id := range approved {
//		idMap[id] = struct{}{}
//	}
//
//	for id := range idMap {
//		transcriptIDs = append(transcriptIDs, id)
//	}
//
//	return transcriptIDs, nil
//}

func GetApprovedTranscript(db *gorm.DB, walletAddress string) ([]models.Transcript, error) {
	var result []models.Transcript

	// 1. Transcripts directly owned
	var ownedTranscripts []models.Transcript
	if err := db.Where("owner_wallet = ?", walletAddress).
		Find(&ownedTranscripts).Error; err != nil {
		return nil, err
	}

	// 2. Get transcript IDs from approved requests
	var approvedIDs []string
	if err := db.Model(&models.RequestTranscript{}).
		Select("transcript_id").
		Joins("JOIN requests ON requests.id = request_transcripts.request_id").
		Where("requests.recipient_wallet = ? AND requests.status = ?", walletAddress, models.Approved).
		Pluck("transcript_id", &approvedIDs).Error; err != nil {
		return nil, err
	}

	// 3. Fetch transcript records matching the approved IDs
	var approvedTranscripts []models.Transcript
	if len(approvedIDs) > 0 {
		if err := db.Where("transcript_id IN ?", approvedIDs).
			Find(&approvedTranscripts).Error; err != nil {
			return nil, err
		}
	}

	// 4. Combine and deduplicate (in case of overlap)
	transcriptMap := make(map[string]models.Transcript)
	for _, t := range ownedTranscripts {
		transcriptMap[t.TranscriptID] = t
	}
	for _, t := range approvedTranscripts {
		transcriptMap[t.TranscriptID] = t
	}

	for _, t := range transcriptMap {
		result = append(result, t)
	}

	return result, nil
}

func CheckAccess(db *gorm.DB, walletAddress string, ipfsURI string) (bool, error) {
	var transcript models.Transcript

	// 1. Find transcript by IPFS URI
	err := db.Where("ipfs_uri_metadata = ? OR ipfs_uri_mediahash = ?", ipfsURI, ipfsURI).
		First(&transcript).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil // No such transcript exists
		}
		return false, err // Database error
	}

	// 2. Check if the walletAddress is the owner
	if transcript.OwnerWallet == walletAddress {
		return true, nil
	}

	// 3. Check if the walletAddress has approved access as recipient
	var count int64
	err = db.Model(&models.RequestTranscript{}).
		Joins("JOIN requests ON requests.id = request_transcripts.request_id").
		Where("request_transcripts.transcript_id = ? AND requests.recipient_wallet = ? AND requests.status = ?", transcript.TranscriptID, walletAddress, models.Approved).
		Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
