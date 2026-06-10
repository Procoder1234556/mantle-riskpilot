// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StrategyDecisionRegistry {
    enum ReviewStatus {
        Proposed,
        Approved,
        Blocked
    }

    struct Decision {
        address agent;
        string strategy;
        string action;
        uint256 confidenceBps;
        uint256 riskBps;
        string rationaleUri;
        bytes32 evidenceHash;
        ReviewStatus status;
        uint256 createdAt;
    }

    address public owner;
    Decision[] private decisions;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    event DecisionRecorded(
        uint256 indexed decisionId,
        address indexed agent,
        string strategy,
        string action,
        uint256 confidenceBps,
        uint256 riskBps,
        string rationaleUri,
        bytes32 evidenceHash
    );

    event DecisionReviewed(uint256 indexed decisionId, ReviewStatus status);

    function recordDecision(
        string calldata strategy,
        string calldata action,
        uint256 confidenceBps,
        uint256 riskBps,
        string calldata rationaleUri,
        bytes32 evidenceHash
    ) external returns (uint256 decisionId) {
        require(confidenceBps <= 10_000, "confidence too high");
        require(riskBps <= 10_000, "risk too high");

        ReviewStatus status = riskBps >= 5_500 ? ReviewStatus.Proposed : ReviewStatus.Approved;
        decisionId = decisions.length;
        decisions.push(
            Decision({
                agent: msg.sender,
                strategy: strategy,
                action: action,
                confidenceBps: confidenceBps,
                riskBps: riskBps,
                rationaleUri: rationaleUri,
                evidenceHash: evidenceHash,
                status: status,
                createdAt: block.timestamp
            })
        );

        emit DecisionRecorded(
            decisionId,
            msg.sender,
            strategy,
            action,
            confidenceBps,
            riskBps,
            rationaleUri,
            evidenceHash
        );
    }

    function reviewDecision(uint256 decisionId, ReviewStatus status) external onlyOwner {
        require(decisionId < decisions.length, "unknown decision");
        decisions[decisionId].status = status;
        emit DecisionReviewed(decisionId, status);
    }

    function getDecision(uint256 decisionId) external view returns (Decision memory) {
        require(decisionId < decisions.length, "unknown decision");
        return decisions[decisionId];
    }

    function decisionCount() external view returns (uint256) {
        return decisions.length;
    }
}
