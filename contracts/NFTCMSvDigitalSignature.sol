// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // to avoid non reenterent while func execution
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EnhancedAcademicCredentialsCMS is 
    Initializable, 
    ERC721Upgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuard {
   
    using ECDSA for bytes32;
    using Address for address;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    // Role definitions
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    struct Credential {
        uint256 tokenId;
        string ipfsURI;
        CredentialStatus status;
        bytes signature;
        address signer;
    }

    enum CredentialStatus {
        VALID,
        REVOKED,
        INVALID
    }

    // Mapping of token IDs to credentials
    mapping(uint256 => Credential) public credentials;
    mapping(string => uint256) private _ipfsURIs; // used to avoid multiple credentials on the same ipfsURL

    // Events
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed institution
    );

    event CredentialStatusChanged(
        uint256 indexed tokenId, 
        CredentialStatus previousStatus, 
        CredentialStatus newStatus, 
        string reason
    );
    
    event InstitutionRegistered(address indexed institution);
    event ManagerRegistered(address indexed manager);

    event ManagerRevoked(
        address indexed manager,
        string reason
    );

    event InstitutionRevoked(
        address indexed institution,
        string reason
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("Academic Credentials", "ACRED");
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    // Modifiers
    modifier onlyAdmin(){
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _;
    }

    modifier onlyManager() {
        _checkRole(MANAGER_ROLE, msg.sender);
        _;
    }

    modifier onlyInstitution() {
        _checkRole(INSTITUTION_ROLE, msg.sender);
        _;
    }

    function registerManager(address _manager)
        external
        onlyAdmin {
        require(!hasRole(MANAGER_ROLE, _manager), "Address is already a manager");
        grantRole(MANAGER_ROLE, _manager);
        emit ManagerRegistered(_manager);
    }

    function revokeManager(
        address _manager,
        string memory reason
    )   external
        onlyAdmin {
        require(hasRole(MANAGER_ROLE, _manager), "Address is not a manager");
        revokeRole(MANAGER_ROLE, _manager);
        emit ManagerRevoked(_manager,  reason);
    }

    // Institution Registration
    function registerInstitution(address _institution) 
        external 
        onlyManager {
        require(!hasRole(INSTITUTION_ROLE, _institution), "Address is already an institution");
        grantRole(INSTITUTION_ROLE, _institution);
        emit InstitutionRegistered(_institution);
    }

    function revokeInstitution(
        address _institution,
        string memory reason
    )   external
        onlyManager {
        require(hasRole(INSTITUTION_ROLE, _institution), "Address is not an institution");
        revokeRole(INSTITUTION_ROLE, _institution);
        emit InstitutionRevoked(_institution, reason);
    }

    function verifySignature(
            bytes32 message,
            address signer,
            bytes memory signature
        )   public
            pure
            returns (bool) {
            bytes32 hash = MessageHashUtils.toEthSignedMessageHash(message);
            address recoveredSigner = hash.recover(signature);
            return signer == recoveredSigner;
    }

    // Credential Issuance with Enhanced Validation
    function issueCredential(
        address _student,
        string memory _ipfsURI,
        bytes32 _hash,
        bytes memory _signature
    )   public
        onlyInstitution
        whenNotPaused
        nonReentrant {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        require(credentials[newTokenId].tokenId == 0, "Token ID already exists");
        require(_ipfsURIs[_ipfsURI]==0, "The IPFS URI is already issued for a credential");
        require(verifySignature(   // check signature before storing it into smart contract
            _hash,
            msg.sender,
            _signature
        ), "Invalid signature");


        credentials[newTokenId] = Credential({
            tokenId: newTokenId,
            status: CredentialStatus.VALID,
            ipfsURI: _ipfsURI,
            signature: _signature,
            signer: msg.sender
        });

        _ipfsURIs[_ipfsURI]=newTokenId;

        _mint(_student, newTokenId);
        emit CredentialIssued(newTokenId, _student, msg.sender);
    }

    function verifyCredential(
        uint256 tokenId,
        bytes32 hash
    )   external
        returns (bool) {
        require(_isMinted(tokenId), "Token does not exist");
        require(credentials[tokenId].status != CredentialStatus.INVALID, "The credential is already invalidated");
        bytes memory signature = credentials[tokenId].signature;
        address signer = credentials[tokenId].signer;
        bool isVerified = verifySignature(hash, signer, signature);
        if(!isVerified){
            credentials[tokenId].status = CredentialStatus.INVALID;
        }
        return isVerified;
    }

    // Enhanced Revocation Mechanism
    function revokeCredential(
        uint256 _tokenId, 
        string memory _reason
    )   public
        onlyInstitution
        nonReentrant {
        require(_isMinted(_tokenId), "Token does not exist");
        Credential storage cred = credentials[_tokenId];
        require(cred.status == CredentialStatus.VALID, "Credential is already REVOKED or is INVALID");
        
        CredentialStatus previousStatus = cred.status;
        cred.status = CredentialStatus.REVOKED;
        
        emit CredentialStatusChanged(
            _tokenId, 
            previousStatus, 
            CredentialStatus.REVOKED, 
            _reason
        );
    }

    // Internal helper function to verify token existence
    function _isMinted(uint256 tokenId)
        internal
        view
        returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    // Token URI with IPFS Integration
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) {
        require(_isMinted(tokenId), "Token does not exist");
        return credentials[tokenId].ipfsURI;
    }

    // Pausability Functions
    function pause() external onlyManager {
        _pause();
    }

    function unpause() external onlyManager {
        _unpause();
    }

    // UUPS Upgradeable Authorization
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyManager
        override {}

    // Interface Support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}