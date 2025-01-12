package customErrors

import "net/http"

type ApiError struct {
	Status  int
	Message string
}

func (e *ApiError) Error() string {
	return e.Message
}

var (
	ErrInvalidSignatureFormat = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature format"}
	ErrInvalidSignatureLength = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature length"}
	ErrInvalidRecoveryID      = &ApiError{Status: http.StatusBadRequest, Message: "Invalid signature recovery id"}
	ErrPublicKeyRecovery      = &ApiError{Status: http.StatusFailedDependency, Message: "Error recovering public key"}
	ErrInsufficientData       = &ApiError{Status: http.StatusBadRequest, Message: "Insufficient data"}
	ErrInternalServer         = &ApiError{Status: http.StatusInternalServerError, Message: "Internal server error"}
	ErrUnprocessableEntity    = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Unprocessable entity"}
	ErrRequestNotFound        = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Request not found"}
	ErrRequestNotPending      = &ApiError{Status: http.StatusUnprocessableEntity, Message: "Request is not in a pending state"}
	ErrFailedToConvertJSON    = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to convert transcript list to JSON"}
	ErrFailedToSaveRequest    = &ApiError{Status: http.StatusInternalServerError, Message: "Failed to save request"}
)
