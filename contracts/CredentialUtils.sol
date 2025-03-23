// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

library CredentialUtils {
    using ECDSA for bytes32;

    function verifySignature(
        bytes32 message,
        address signer,
        bytes memory signature
    )   internal
        pure
        returns (bool) {
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(message);
        address recoveredSigner = hash.recover(signature);
        return signer == recoveredSigner;
    }

}
