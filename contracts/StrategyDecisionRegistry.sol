// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StrategyDecisionRegistry {
    struct Decision {
        address agent;
        string strategy;
        string action;
        uint256 confidenceBps;
        uint256 riskBps;
        string rationaleUri;
        uint256 createdAt;
    }

    Decision[] private decisions;

    event DecisionRecorded(
        uint256 indexed decisionId,
        address indexed agent,
        string strategy,
        string action,
        uint256 confidenceBps,
        uint256 riskBps,
        string rationaleUri
    );

    function recordDecision(
        string calldata strategy,
        string calldata action,
        uint256 confidenceBps,
        uint256 riskBps,
        string calldata rationaleUri
    ) external returns (uint256 decisionId) {
        require(confidenceBps <= 10_000, "confidence too high");
        require(riskBps <= 10_000, "risk too high");

        decisionId = decisions.length;
        decisions.push(
            Decision({
                agent: msg.sender,
                strategy: strategy,
                action: action,
                confidenceBps: confidenceBps,
                riskBps: riskBps,
                rationaleUri: rationaleUri,
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
            rationaleUri
        );
    }

    function getDecision(uint256 decisionId) external view returns (Decision memory) {
        require(decisionId < decisions.length, "unknown decision");
        return decisions[decisionId];
    }

    function decisionCount() external view returns (uint256) {
        return decisions.length;
    }
}
