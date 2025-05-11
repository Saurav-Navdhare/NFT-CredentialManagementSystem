package customErrors

import "net/http"

type ApiError struct {
	Status  int
	Message string
}

func (e *ApiError) Error() string {
	return e.Message
}

func (e *ApiError) ErrorWithAdditionalMessage(additionalMessage string) string {
	return e.Message + ": " + additionalMessage
}

var (
	ErrFailedToConvertJSON    = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to convert transcript list to JSON"}
	ErrFailedToCreateNonce    = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to create nonce"}
	ErrFailedToCreateSession  = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to create session"}
	ErrFailedToSaveRequest    = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to save request"}
	ErrInsufficientData       = &ApiError{Status: http.StatusBadRequest, Message: "Insufficient data"}
	ErrInsufficientHeaders    = &ApiError{Status: http.StatusBadRequest, Message: "Insufficient headers"}
	ErrInternalServer         = &ApiError{Status: http.StatusInternalServerError, Message: "Internal server error"}
	ErrInvalidData            = &ApiError{Status: http.StatusBadRequest, Message: "Invalid data"}
	ErrInvalidSessionToken    = &ApiError{Status: http.StatusUnauthorized, Message: "Invalid session token"}
	ErrInvalidSignatureFormat = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature format"}
	ErrInvalidSignature       = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature "}
	ErrInvalidSignatureLength = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature length"}
	ErrInvalidRecoveryID      = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature recovery id"}
	ErrInvalidWalletType      = &ApiError{Status: http.StatusBadRequest, Message: "Invalid input. Ensure 'wallet_type' is either 'student_wallet' or 'recipient_wallet'"}
	ErrNoWalletAddressHeader  = &ApiError{Status: http.StatusBadRequest, Message: "No Wallet-Address Header Found"}
	ErrPublicKeyRecovery      = &ApiError{Status: http.StatusFailedDependency, Message: "Error recovering public key"}
	ErrRequestNotApproved     = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Request is not in an approved state"}
	ErrRequestNotFound        = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Request not found"}
	ErrRequestNotPending      = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Request is not in a pending state"}
	ErrUnprocessableEntity    = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Unprocessable entity"}
	ErrUnauthorizedTranscript = &ApiError{Status: http.StatusUnauthorized, Message: "Unauthorized to access this transcript"}
)
