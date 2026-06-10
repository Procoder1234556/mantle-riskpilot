# Mantle RiskPilot

Mantle RiskPilot is a full-stack AI agent dashboard for Mantle DeFi strategy monitoring. It turns pool, volatility, liquidity, and risk signals into explainable agent decisions, then prepares those decisions for on-chain recording through a Solidity decision registry.

Built for The Turing Test Hackathon 2026.

Public repo: https://github.com/Procoder1234556/mantle-riskpilot

Production demo URL: pending Vercel deployment

Presentation page: `/#presentation`

## Hackathon Fit

- Track: AI Trading & Strategy / AI DevTools
- Network target: Mantle Network
- AI component: strategy recommendation engine with transparent rationale
- On-chain component: `StrategyDecisionRegistry.sol` records agent decisions, confidence, and risk score
- Product component: responsive dashboard for operators to review and trigger strategies
- Safety component: medium/high-risk actions are proposed for review instead of being auto-signed

## What It Does

- Scores Mantle DeFi opportunities across liquidity, volatility, risk, and momentum
- Explains why an agent recommends hold, rebalance, reduce exposure, or monitor
- Shows an auditable activity timeline for every agent decision
- Includes a Solidity contract scaffold for storing AI strategy decisions on-chain
- Models the agent flow as market intake, reasoning, execution guard, and on-chain registry
- Produces rationale artifacts that can be pinned and referenced by an on-chain evidence hash

## Why It Can Win

RiskPilot focuses on a real missing layer in agentic DeFi: accountability before execution. Judges can see the AI reasoning, the risk gate, the Mantle-specific protocol model, and the exact contract interface that makes decisions auditable.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Architecture

```text
frontend dashboard -> recommendation engine -> decision payload
decision payload -> StrategyDecisionRegistry.sol -> Mantle transaction log
```

## Key Files

- `src/agentWorkflow.ts` - builds the agent run, stages, and audit summary
- `src/riskEngine.ts` - scores Mantle opportunities and emits typed decisions
- `src/mantleProtocols.ts` - maps Mantle protocol roles and risk surfaces
- `contracts/StrategyDecisionRegistry.sol` - on-chain decision registry
- `PITCH.md` - judge-facing pitch
- `SUBMISSION.md` - DoraHacks submission draft

## Deployment Notes

The current repository includes the frontend, recommendation model stub, and smart contract scaffold. The next production step is deploying `contracts/StrategyDecisionRegistry.sol` to Mantle Sepolia or Mantle Mainnet and wiring the returned contract address into the dashboard.

The frontend is configured for Vercel. Build output is generated with `npm run build` and served from `dist`.

## Open-Source Base Research

This project was informed by open-source Web3 AI agent patterns from:

- `danilobatson/ai-trading-agent-gemini` for progress-oriented AI signal dashboards
- `edkdev/defi-trading-mcp` for discovery, risk, quote, and execution tool boundaries
- `0xgasless/agentkit` for schema-like on-chain action abstractions
- `chainstacklabs/web3-ai-trading-agent` for the broader autonomous trading-agent pipeline

The code in this repository is a fresh Mantle-focused implementation for the hackathon submission.

## License

MIT
