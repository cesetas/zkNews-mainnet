//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@appliedzkp/semaphore-contracts/interfaces/IVerifier.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreCore.sol";
import "@appliedzkp/semaphore-contracts/base/SemaphoreGroups.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract zkNews is SemaphoreCore, SemaphoreGroups, Ownable {


    // The external verifier used to verify Semaphore proofs.
    IVerifier public verifier;

    address public contractAddress = address(this);

   
    

    struct Post {
        bytes32 postId;
        uint256 hashCommitment;
        uint256 likes; 
        uint256 dislikes;
        uint256 balance; 
    }

     uint256[] public identityCommitments;

    mapping(bytes32 => Post) public posts; 

    // event Registration(bytes32 signal);
    event NewPost(bytes32 postId);
    event IdentityCommitment(uint256 indexed identityCommitment);
    event Withdrawal(bytes32 postId, uint256 balance);
    event Funded(bytes32 postId);


    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    function getIdentityCommitments() public view returns (uint256 [] memory) {
        return identityCommitments;
    }

    function getIdentityCommitment(uint256 _index) public view returns (uint256) {
        return identityCommitments[_index];
    }


    function insertIdentityAsClient(uint256 _leaf) public {
        identityCommitments.push(_leaf);
        emit IdentityCommitment(_leaf);
    }


    function postNews(
        bytes32 postId,
        uint hashCommitment
    )
        external
    {
        Post memory post = Post({postId: postId, hashCommitment:hashCommitment,likes: 0, dislikes: 0, balance:0});
        posts[postId] = post;  
        emit NewPost(postId);
    }

    function likePost(
        bytes32 postId,
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    )
        external
        returns (uint256)
    {
        _verifyProof(
                signal,
                root,
                nullifierHash,
                externalNullifier,
                proof,
                verifier
            );

        posts[postId].likes += 1;
        
        _saveNullifierHash(nullifierHash);

        return (posts[postId].likes);
    }

    function dislikePost(
        bytes32 postId,
        bytes32 signal,
        uint256 root,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    )
        external
        returns (uint256)
    {
        _verifyProof(
                signal,
                root,
                nullifierHash,
                externalNullifier,
                proof,
                verifier
            );

        posts[postId].dislikes += 1;
        
        _saveNullifierHash(nullifierHash);

        return (posts[postId].dislikes);
    }

    function getAllFunds() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function getPostFunds(bytes32 postId) external view returns (uint256) {
        return posts[postId].balance;
    }

    function getPostLikes(bytes32 postId) external view returns (uint256) {
        return posts[postId].likes;
    }

    function getPostDislikes(bytes32 postId) external view returns (uint256) {
        return posts[postId].dislikes;
    }

    
    function withdrawFunds(bytes32 _postId, uint _amount, uint _hashCommitment) public payable {
        require(_amount>0, "must be positive");
        require(_amount <= posts[_postId].balance,"Not enough balance");
        require(_hashCommitment == posts[_postId].hashCommitment,"Your hashcommitment is wrong");
        payable(msg.sender).transfer(_amount);
         posts[_postId].balance -= _amount;
         emit Withdrawal(_postId, _amount);
    }

    function  fundPost( bytes32 postId ) payable public {
        require(msg.value>0, "must be more than zero");
        require(posts[postId].likes >= posts[postId].dislikes, "This post can not be funded");
        posts[postId].balance += msg.value;
         emit Funded(postId);
    }
}