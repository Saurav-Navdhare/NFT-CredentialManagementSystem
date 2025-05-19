// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // to avoid non reenterent while func execution
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./CredentialUtils.sol";

contract NFTCMS is 
    Initializable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    ERC721EnumerableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuard {
   
    using ECDSA for bytes32;
    using Address for address;
    
    uint256 private _tokenId=0;

    function incrementTokenId() internal {
        _tokenId++;
    }

    function getCurrentTokenId() internal view returns(uint256) {
        return _tokenId;
    }

    // Role definitions
    bytes32 private constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 private constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    struct Credential {
        uint256 tokenId;
        string ipfsURI;
        CredentialStatus status;
        bytes signature;
        address signer;
    }

    enum CredentialStatus {
        VALID,
        REVOKED
        // INVALID
    }

    // Mapping of token IDs to credentials
    mapping(uint256 => Credential) public credentials;
    mapping(string => uint256) private _ipfsURIs; // used to avoid multiple credentials on the same ipfsURL

    // Events
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed institution,
        string title
    );

    event CredentialStatusChanged(
        uint256 indexed tokenId, 
        CredentialStatus previousStatus, 
        CredentialStatus newStatus, 
        string reason
    );
    
    event InstitutionRegistered(address indexed institution, string name);
    event ModeratorRegistered(address indexed moderator, string name);

    event ModeratorRevoked(
        address indexed moderator,
        string reason
    );

    event InstitutionRevoked(
        address indexed institution,
        string reason
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("Academic Credentials", "ACRED");
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __ERC721Enumerable_init();
    }

    // Modifiers
    modifier onlyAdmin(){
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _;
    }

    modifier onlyModerator() {
        _checkRole(MODERATOR_ROLE, msg.sender);
        _;
    }

    modifier onlyInstitution() {
        _checkRole(INSTITUTION_ROLE, msg.sender);
        _;
    }


    function registerModerator(address _moderator, string memory _name)
        external
        onlyAdmin {
        require(_moderator != address(0), "Invalid moderator address");
        require(!hasRole(MODERATOR_ROLE, _moderator), "Address is already a moderator");
        require(!hasRole(INSTITUTION_ROLE, _moderator), "Address is already an institution");
        require(!hasRole(DEFAULT_ADMIN_ROLE, _moderator), "Address is already an admin");
        _grantRole(MODERATOR_ROLE, _moderator);
        emit ModeratorRegistered(_moderator, _name);
    }

    function revokeModerator(
        address _moderator,
        string memory reason
    )   external
        onlyAdmin {
        require(hasRole(MODERATOR_ROLE, _moderator), "Address is not a moderator");
        _revokeRole(MODERATOR_ROLE, _moderator);
        emit ModeratorRevoked(_moderator,  reason);
    }

    // Institution Registration
    function registerInstitution(address _institution, string memory _name)
        external 
        onlyModerator {
        require(_institution != address(0), "Invalid moderator address");
        require(!hasRole(MODERATOR_ROLE, _institution), "Address is already a moderator");
        require(!hasRole(INSTITUTION_ROLE, _institution), "Address is already an institution");
        require(!hasRole(DEFAULT_ADMIN_ROLE, _institution), "Address is already an admin");
        _grantRole(INSTITUTION_ROLE, _institution);
        emit InstitutionRegistered(_institution, _name);
    }

    function revokeInstitution(
        address _institution,
        string memory reason
    )   external
        onlyModerator {
        require(hasRole(INSTITUTION_ROLE, _institution), "Address is not an institution");
        _revokeRole(INSTITUTION_ROLE, _institution);
        emit InstitutionRevoked(_institution, reason);
    }

    // Credential Issuance with Enhanced Validation
    function issueCredential(
        address _student,
        string memory _ipfsURI,
        bytes32 _hash,
        bytes memory _signature,
        string memory title
    )   public
        onlyInstitution
        whenNotPaused
        nonReentrant {
        require(_student != address(0), "Invalid moderator address");
        require(_ipfsURIs[_ipfsURI]==0, "The IPFS URI is already issued for a credential");
        require(CredentialUtils.verifySignature(   // check signature before storing it into smart contract
            _hash,
            msg.sender,
            _signature
        ), "Invalid signature");

        incrementTokenId();
        uint256 newTokenId = getCurrentTokenId();
        require(credentials[newTokenId].tokenId == 0, "Token ID already exists");

        credentials[newTokenId] = Credential({
            tokenId: newTokenId,
            status: CredentialStatus.VALID,
            ipfsURI: _ipfsURI,
            signature: _signature,
            signer: msg.sender
        });

        _ipfsURIs[_ipfsURI]=newTokenId;

        _mint(_student, newTokenId);
        emit CredentialIssued(newTokenId, _student, msg.sender, title);
    }

    function verifyCredential(
        uint256 tokenId,
        bytes32 hash
    )   external
        view
        returns (bool) {
        require(_isMinted(tokenId), "Token does not exist");
        // require(credentials[tokenId].status != CredentialStatus.INVALID, "The credential is already invalidated");
        bytes memory signature = credentials[tokenId].signature;
        address signer = credentials[tokenId].signer;
        bool isVerified = CredentialUtils.verifySignature(hash, signer, signature);
        // if(!isVerified){
        //     credentials[tokenId].status = CredentialStatus.INVALID;
        // }
        return isVerified;
    }

    // Enhanced Revocation Mechanism
    function revokeCredential(
        uint256 tokenId, 
        string memory reason
    )   public
        onlyInstitution
        nonReentrant {
        require(_isMinted(tokenId), "Token does not exist");
        Credential storage cred = credentials[tokenId];
        require(cred.status == CredentialStatus.VALID, "Credential is already REVOKED");
        
        CredentialStatus previousStatus = cred.status;
        cred.status = CredentialStatus.REVOKED;
        
        emit CredentialStatusChanged(
            tokenId, 
            previousStatus, 
            CredentialStatus.REVOKED, 
            reason
        );
    }

    function fetchRole()
        external
        view
        returns (string memory){
        if(hasRole(DEFAULT_ADMIN_ROLE, msg.sender)){
            return "ADMIN";
        } else if(hasRole(MODERATOR_ROLE, msg.sender)){
            return "MODERATOR";
        } else if(hasRole(INSTITUTION_ROLE, msg.sender)){
            return "INSTITUTION";
        } else {
            return "USER";
        }
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
    function pause() external onlyModerator {
        _pause();
    }

    function unpause() external onlyModerator {
        _unpause();
    }

    // UUPS Upgradeable Authorization
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyModerator
        override {}

    // Interface Support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721EnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}