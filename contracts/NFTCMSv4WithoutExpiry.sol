// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FlexibleAcademicCredentialsCMS is 
    Initializable, 
    ERC721Upgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable 
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Role definitions
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    // Maximum allowed validity period (2 years)
    uint256 public constant MAX_VALIDITY_PERIOD = 730 days;

    // Special constant to represent no expiration
    uint256 public constant NO_EXPIRATION = type(uint256).max;

    // Maximum metadata length
    uint256 public constant MAX_METADATA_LENGTH = 1000;

    // Time-lock period for critical functions
    uint256 public constant TIME_LOCK_PERIOD = 2 days;

    struct Credential {
        uint256 tokenId;
        uint256 issuedTimestamp;
        uint256 expirationTimestamp; // Can be NO_EXPIRATION
        address institution;
        CredentialStatus status;
        bytes32 ipfsHash;
        bool hasExpiration; // Flag to indicate if credential has an expiry
    }

    enum CredentialStatus {
        VALID,
        REVOKED,
        EXPIRED
    }

    // Mapping of token IDs to credentials
    mapping(uint256 => Credential) public credentials;

    // Tracking time-locked administrative actions
    mapping(bytes32 => uint256) private _timelockActions;

    // Events
    event CredentialIssued(
        uint256 indexed tokenId, 
        address indexed student, 
        address indexed institution, 
        bool hasExpiration
    );
    event CredentialStatusChanged(
        uint256 indexed tokenId, 
        CredentialStatus previousStatus, 
        CredentialStatus newStatus, 
        string reason
    );
    event InstitutionRegistered(address indexed institution, string indexed name);
    event InstitutionDeregistered(address indexed institution);
    event ManagerRegistered(address indexed manager);
    event ManagerDeregistered(address indexed manager);
    event TimelockInitiated(bytes32 actionHash, uint256 executeTime);

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

    function registerManager(address _manager) external onlyAdmin {
        require(!hasRole(MANAGER_ROLE, _manager), "Already a manager");
        grantRole(MANAGER_ROLE, _manager);
        emit ManagerRegistered(_manager);
    }

    function deregisterManager(address _manager) external onlyAdmin {
        require(hasRole(MANAGER_ROLE, _manager), "Not a manager");
        require(!hasRole(DEFAULT_ADMIN_ROLE, _manager), "Cannot deregister Admin");
        revokeRole(MANAGER_ROLE, _manager);
        emit ManagerDeregistered(_manager);
    }

    // Enhanced Institution Registration
    function registerInstitutions(address[] memory _institutions, string[] memory _names) 
        external 
        onlyManager 
    {
        for (uint i = 0; i < _institutions.length; i++) {
            grantRole(INSTITUTION_ROLE, _institutions[i]);
            emit InstitutionRegistered(_institutions[i], _names[i]);
        }
    }

    // Delist an institution by revoking the INSTITUTION_ROLE
    function delistInstitution(address _institution) external onlyManager {
        require(hasRole(INSTITUTION_ROLE, _institution), "Address is not a verified institution");
        revokeRole(INSTITUTION_ROLE, _institution);
        emit InstitutionDeregistered(_institution);
    }

    // Relist an institution by revoking the INSTITUTION_ROLE
    function relistInstitution(address _institution) external onlyManager {
        require(!hasRole(INSTITUTION_ROLE, _institution), "Address is already a verified institution");
        grantRole(INSTITUTION_ROLE, _institution);
    }

    // Credential Issuance with Flexible Expiration
    function issueCredential(
        address _student,
        bytes32 _ipfsHash,
        uint256 _validityPeriod // 0 means no expiration
    ) public onlyInstitution whenNotPaused {
        // Validate input parameters
        require(
            _validityPeriod == 0 || _validityPeriod <= MAX_VALIDITY_PERIOD, 
            "Invalid validity period"
        );

        uint256 newTokenId = _tokenIds.current();
        require(credentials[newTokenId].tokenId == 0, "Token ID already exists");

        // Determine expiration
        bool hasExpiration = _validityPeriod > 0;
        uint256 expirationTimestamp = hasExpiration 
            ? block.timestamp + _validityPeriod 
            : NO_EXPIRATION;

        credentials[newTokenId] = Credential({
            tokenId: newTokenId,
            issuedTimestamp: block.timestamp,
            expirationTimestamp: expirationTimestamp,
            institution: msg.sender,
            status: CredentialStatus.VALID,
            ipfsHash: _ipfsHash,
            hasExpiration: hasExpiration
        });

        _mint(_student, newTokenId);
        emit CredentialIssued(newTokenId, _student, msg.sender, hasExpiration);
        _tokenIds.increment();
    }

    // Enhanced Revocation Mechanism
    function revokeCredential(
        uint256 _tokenId, 
        string memory _reason
    ) public onlyInstitution {
        Credential storage cred = credentials[_tokenId];
        require(cred.status == CredentialStatus.VALID, "Credential not valid");
        require(cred.institution == msg.sender, "Unauthorized to revoke Credential! Only assigning institution can revoke credential");
        
        CredentialStatus previousStatus = cred.status;
        cred.status = CredentialStatus.REVOKED;
        
        emit CredentialStatusChanged(
            _tokenId, 
            previousStatus, 
            CredentialStatus.REVOKED, 
            _reason
        );
    }

    // Update Credential Status (Automatic Expiration)
    function updateCredentialStatus(uint256 _tokenId) public {
        Credential storage cred = credentials[_tokenId];
        require(cred.tokenId == _tokenId, "Credential does not exist");
        require(cred.institution == msg.sender, "Unauthorized to revoke Credential! Only assigning institution can update credential status");

        // Only change status if:
        // 1. Credential has an expiration
        // 2. Current time has passed expiration
        // 3. Current status is still valid
        if (cred.hasExpiration && 
            block.timestamp > cred.expirationTimestamp && 
            cred.status == CredentialStatus.VALID) 
        {
            CredentialStatus previousStatus = cred.status;
            cred.status = CredentialStatus.EXPIRED;

            emit CredentialStatusChanged(
                _tokenId, 
                previousStatus, 
                CredentialStatus.EXPIRED, 
                "Credential expired"
            );
        }
    }

    // Check if credential is currently valid
    function isCredentialValid(uint256 _tokenId) public view returns (bool) {
        Credential memory cred = credentials[_tokenId];
        
        // Check if credential exists
        if (cred.tokenId == 0) return false;
        
        // Check status
        if (cred.status != CredentialStatus.VALID) return false;
        
        // If no expiration, always valid
        if (!cred.hasExpiration) return true;
        
        // Check against current time
        return block.timestamp <= cred.expirationTimestamp;
    }

    // // Time-locked Administrative Action Preparation
    // function prepareTimelockAction(bytes32 _actionHash) public onlyManager {
    //     _timelockActions[_actionHash] = block.timestamp + TIME_LOCK_PERIOD;
    //     emit TimelockInitiated(_actionHash, _timelockActions[_actionHash]);
    // }

    // // Verify Time-locked Action
    // function _verifyTimelockAction(bytes32 _actionHash) internal view {
    //     require(
    //         _timelockActions[_actionHash] != 0 && 
    //         block.timestamp >= _timelockActions[_actionHash], 
    //         "Timelock period not elapsed"
    //     );
    // }


    // Internal helper function to verify token existence
    function _isMinted(uint256 tokenId) internal view returns (bool) {
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
        returns (string memory) 
    {
        require(_isMinted(tokenId), "Token does not exist");
        return string(abi.encodePacked(
            "ipfs://", 
            bytes32ToString(credentials[tokenId].ipfsHash)
        ));
    }

    // Utility function to convert bytes32 to string
    function bytes32ToString(bytes32 _bytes32) 
        public 
        pure 
        returns (string memory) 
    {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytes1 temp = bytes1(_bytes32[i]);
            uint8 high = uint8(temp) / 16;
            uint8 low = uint8(temp) % 16;
            
            bytesArray[i*2] = bytes1(high + (high < 10 ? 48 : 87));
            bytesArray[i*2+1] = bytes1(low + (low < 10 ? 48 : 87));
        }
        return string(bytesArray);
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
        override
    {}

    // Bulk Credential Status Update
    function bulkUpdateCredentialStatuses(uint256[] memory _tokens) public {
        for (uint256 i = 0; i < _tokens.length; i++) {
            updateCredentialStatus(_tokens[i]);
        }
    }

    // Interface Support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}