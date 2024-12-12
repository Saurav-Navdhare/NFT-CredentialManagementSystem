// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTCMS is ERC721 {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event InstitutionApproved(address indexed institution);
    event InstitutionDisapproved(address indexed institution);
    event TranscriptAdded(uint256 indexed tokenId, address indexed student, address indexed institution);
    event TranscriptDisapproved(uint256 indexed tokenId);
    event TranscriptReapproved(uint256 indexed tokenId);

    address public manager;

    struct Payload {
        uint256 tokenId;
        address institution;
        string ipfsHash;
        bool isValid;
    }

    mapping(address => bool) approvedInstitutions;
    mapping(uint256 => Payload) public payloads;
    mapping(uint256 => bool) public tokenExists;

    constructor() ERC721("NFTCMS", "CMS"){
        manager = msg.sender;
    }
    
    modifier onlyOwner(){
        require(msg.sender==manager, "Transaction initiator is not authorized as an approver");
        _;
    }

    modifier onlyVerifiedInstitution(){
        require(approvedInstitutions[msg.sender], "Transaction initiator isn't an approved Institution");
        _;
    }

    modifier checkTokenExists(uint256 tokenId){
        require(tokenExists[tokenId], "Token does not exists");
        _;
    }

    function approveInstitution(address _institution) public onlyOwner {
        approvedInstitutions[_institution]=true;
        emit InstitutionApproved(_institution);
    }

    function disapproveInstitution(address _institution) public onlyOwner {
        approvedInstitutions[_institution]=false;
        emit InstitutionDisapproved(_institution);
    }

    function addTranscript(address _student, string memory ipfsHash) public onlyVerifiedInstitution {
        uint256 newTokenId = _tokenIds.current();
        payloads[newTokenId] = Payload(newTokenId, msg.sender, ipfsHash, true);
        _mint(_student, newTokenId);
        tokenExists[newTokenId]=true;
        emit TranscriptAdded(newTokenId, _student, msg.sender);
        _tokenIds.increment();
    }

    function getTranscript(uint256 _tokenId) public checkTokenExists(_tokenId) view returns (Payload memory) {
        return payloads[_tokenId];
    }

    function disApproveTranscript(uint256 _tokenId) onlyVerifiedInstitution checkTokenExists(_tokenId) public {
        require(msg.sender == payloads[_tokenId].institution, "Only the issuing institution can update this token");
        require(payloads[_tokenId].isValid, "Token is already invalid");
        payloads[_tokenId].isValid = false;
        emit TranscriptDisapproved(_tokenId);
    }

    function reapproveTranscript(uint256 _tokenId) onlyVerifiedInstitution checkTokenExists(_tokenId) public {
        require(msg.sender == payloads[_tokenId].institution, "Only the issuing institution can update this token");
        require(!payloads[_tokenId].isValid, "Token is already valid");
        payloads[_tokenId].isValid = true;
        emit TranscriptReapproved(_tokenId);
    }

}