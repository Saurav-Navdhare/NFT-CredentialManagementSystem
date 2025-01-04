package utils

import (
	"api/customErrors"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

func VerifySignature(message, signature, walletAddress string) (bool, error) {
	// Convert hex signature to bytes
	sig, err := hexutil.Decode(signature)
	if err != nil {
		return false, fmt.Errorf("%w: %v", customErrors.ErrInvalidSignatureFormat, err)
	}

	// Check signature length
	if len(sig) != 65 {
		return false, customErrors.ErrInvalidSignatureLength
	}

	// Handle 'Ethereum Signed Message' prefix
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	hash := crypto.Keccak256Hash([]byte(msg))

	// Convert signature to ECDSA format
	if sig[64] != 27 && sig[64] != 28 {
		return false, customErrors.ErrInvalidRecoveryID
	}
	sig[64] -= 27

	// Recover public key from signature
	pubKey, err := crypto.SigToPub(hash.Bytes(), sig)
	if err != nil {
		return false, customErrors.ErrPublicKeyRecovery
	}

	// Derive address from public key
	recoveredAddr := crypto.PubkeyToAddress(*pubKey)

	// Compare recovered address with provided address
	providedAddr := common.HexToAddress(walletAddress)

	return recoveredAddr == providedAddr, nil
}
