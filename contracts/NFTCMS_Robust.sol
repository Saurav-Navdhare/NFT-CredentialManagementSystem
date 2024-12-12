// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ImprovedNFTCMS is ERC721, AccessControl, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    struct Credential {
        uint256 tokenId;
        uint256 issuedTimestamp;
        uint256 expirationTimestamp;
        address institution;
        CredentialStatus status;
        string ipfsHash;
        string additionalMetadata;
    }

    enum CredentialStatus {
        VALID,
        REVOKED,
        EXPIRED
    }

    mapping(uint256 => Credential) public credentials;

    event CredentialIssued(uint256 indexed tokenId, address indexed student, address indexed institution);
    event CredentialStatusChanged(uint256 indexed tokenId, CredentialStatus previousStatus, CredentialStatus newStatus, string reason);
    event InstitutionRegistered(address indexed institution);

    constructor() ERC721("Academic Credentials", "ACRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    modifier onlyManager() {
        _checkRole(MANAGER_ROLE, msg.sender);
        _;
    }

    modifier onlyInstitution() {
        _checkRole(INSTITUTION_ROLE, msg.sender);
        _;
    }

    function registerInstitution(address _institution) external onlyManager {
        grantRole(INSTITUTION_ROLE, _institution);
        emit InstitutionRegistered(_institution);
    }

    function issueCredential(
        address _student,
        string memory _ipfsHash,
        uint256 _validityPeriod,
        string memory _additionalMetadata
    ) public onlyInstitution whenNotPaused {
        require(_validityPeriod > 0 && _validityPeriod <= 365 days, "Invalid validity period");
        
        uint256 newTokenId = _tokenIds.current();
        require(credentials[newTokenId].tokenId == 0, "Token ID already exists");

        credentials[newTokenId] = Credential({
            tokenId: newTokenId,
            issuedTimestamp: block.timestamp,
            expirationTimestamp: block.timestamp + _validityPeriod,
            institution: msg.sender,
            status: CredentialStatus.VALID,
            ipfsHash: _ipfsHash,
            additionalMetadata: _additionalMetadata
        });

        _mint(_student, newTokenId);
        emit CredentialIssued(newTokenId, _student, msg.sender);
        _tokenIds.increment();
    }

    function updateCredentialStatus(uint256 _tokenId) public {
        Credential storage cred = credentials[_tokenId];
        require(cred.tokenId == _tokenId, "Credential does not exist");

        if (block.timestamp > cred.expirationTimestamp && cred.status == CredentialStatus.VALID) {
            CredentialStatus previousStatus = cred.status;
            cred.status = CredentialStatus.EXPIRED;

            emit CredentialStatusChanged(_tokenId, previousStatus, CredentialStatus.EXPIRED, "Credential expired");
        }
    }

function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_isMinted(tokenId), "Token does not exist");
    return string(abi.encodePacked("ipfs://", credentials[tokenId].ipfsHash));
}

// Internal helper function to verify token existence
function _isMinted(uint256 tokenId) internal view returns (bool) {
    try this.ownerOf(tokenId) returns (address) {
        return true;
    } catch {
        return false;
    }
}


    function pause() external onlyManager {
        _pause();
    }

    function unpause() external onlyManager {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
