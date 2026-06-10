# DoraHacks Submission Draft

## Project Name

Mantle RiskPilot

## Vision

Autonomous AI agents should not move capital through DeFi without transparent reasoning, risk limits, and an audit trail. Mantle RiskPilot solves this by turning Mantle DeFi and RWA signals into explainable agent decisions that operators can review and record on-chain.

## Category

Crypto / Web3 and AI / Robotics

## Is this BUIDL an AI Agent?

Yes.

## GitHub

https://github.com/Procoder1234556/mantle-riskpilot

## Project Website

https://mantle-riskpilot.vercel.app

Presentation page:
https://mantle-riskpilot.vercel.app/#presentation

## Demo Video

Pending. Suggested title: "Mantle RiskPilot - AI DeFi Risk Copilot Demo".

## Social Link

https://github.com/Procoder1234556

## Short Description

AI DeFi risk copilot for Mantle that scores protocol opportunities, explains every strategy decision, gates risky actions, and prepares approved recommendations for on-chain registry.

## Longer Description

Mantle RiskPilot is a full-stack AI agent dashboard for Mantle DeFi operators. It models opportunities across mETH, Merchant Moe, Agni, stable routing, and RWA yield, then produces structured strategy recommendations with confidence, risk score, rationale, and evidence. A Solidity decision registry records approved AI decisions on-chain with an evidence hash and review status so teams can audit how autonomous agents behave before capital moves.

## Track Fit

- AI Trading & Strategy: strategy recommendations, risk scoring, and portfolio action gates.
- AI DevTools: operator workflow and on-chain decision registry for agent governance.
- AI x RWA: defensive RWA sleeve scoring and allocation rationale.

## Contract

`contracts/StrategyDecisionRegistry.sol` is included. Deployment is pending.

## Demo Checklist

- Show the strategy board and average risk/confidence metrics.
- Open the decision registry panel and show the encoded contract call.
- Show the sample rationale artifact with evidence and payload.
- Explain the risk gate: medium/high-risk actions require review before signing.
- Mention Mantle protocol map and why the model is Mantle-specific.
