# Mantle RiskPilot Pitch

## One-liner

Mantle RiskPilot is an AI DeFi risk copilot that turns Mantle liquidity, RWA yield, volatility, and concentration signals into explainable agent decisions that can be reviewed by humans and recorded on-chain.

## Problem

Autonomous DeFi agents are powerful, but most demos skip the hardest part: proving why an agent made a decision before capital moves. In real markets, teams need:

- transparent reasoning,
- guardrails before execution,
- Mantle-specific protocol context,
- and an auditable record of every AI recommendation.

## Solution

RiskPilot gives operators a structured workflow:

1. Ingest Mantle opportunities from liquid staking, DEX liquidity, stable routes, and RWA yield.
2. Score each opportunity by liquidity, volatility, concentration, yield, and momentum.
3. Generate an AI-style decision with confidence, risk, and rationale.
4. Block risky actions behind a human review gate.
5. Encode approved decisions for `StrategyDecisionRegistry.sol` on Mantle.

## Why Mantle

Mantle is a strong home for this because its ecosystem combines liquid staking assets, DEX liquidity, RWA assets, and institution-facing distribution. That creates exactly the kind of cross-surface risk problem where autonomous agents need transparent controls.

## Technical Depth

- React + TypeScript operator dashboard.
- Original TypeScript scoring engine and agent workflow.
- Mantle protocol intelligence model.
- Solidity registry with decision status, evidence hash, risk score, confidence score, and rationale URI.
- GitHub Pages-ready frontend deployment.

## Innovation

Instead of presenting an agent as a black-box trader, RiskPilot treats the agent as an accountable on-chain actor. The project focuses on the missing control layer between AI reasoning and transaction signing.

## Roadmap

- Deploy `StrategyDecisionRegistry.sol` to Mantle Sepolia.
- Add live Mantle RPC reads for balances and contract decision history.
- Integrate DEXScreener/CoinGecko pool feeds for live opportunity intake.
- Add wallet signing for approved low-risk decisions.
- Publish 2-minute demo video.
