package customErrors

import "errors"

var (
	ErrInvalidSignatureFormat = errors.New("invalid signature format")
	ErrInvalidSignatureLength = errors.New("invalid signature length")
	ErrInvalidRecoveryID      = errors.New("invalid signature recovery id")
	ErrPublicKeyRecovery      = errors.New("error recovering public key")
)
