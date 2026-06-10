export type AgentAction = "HOLD" | "MONITOR" | "REBALANCE" | "REDUCE" | "INCREASE";

export type MantleOpportunity = {
  id: string;
  strategy: string;
  protocol: string;
  asset: string;
  category: "liquid-staking" | "dex-liquidity" | "rwa-yield" | "stable-routing";
  liquidityUsd: number;
  volatilityBps: number;
  yieldBps: number;
  momentumScore: number;
  concentrationRisk: number;
  gasCostUsd: number;
  tvlChange24hPct: number;
  drawdown30dPct: number;
  sharpeEstimate: number;
  auditStatus: "verified" | "monitored" | "experimental";
  lastSignal: string;
  evidence: string[];
  protocolUrl: string;
  tradeUrl: string;
};

export type AgentDecision = {
  opportunityId: string;
  strategy: string;
  protocol: string;
  action: AgentAction;
  confidence: number;
  riskScore: number;
  expectedYieldBps: number;
  rationale: string[];
  onchainPayload: {
    strategy: string;
    action: string;
    confidenceBps: number;
    riskBps: number;
    rationaleUri: string;
  };
};

export type PipelineStage = {
  name: string;
  status: "complete" | "active" | "queued";
  detail: string;
};

export const mantleOpportunities: MantleOpportunity[] = [
  {
    id: "meth-lsp-guard",
    strategy: "mETH Liquidity Guard",
    protocol: "Mantle LSP",
    asset: "mETH/MNT",
    category: "liquid-staking",
    liquidityUsd: 2_840_000,
    volatilityBps: 410,
    yieldBps: 690,
    momentumScore: 78,
    concentrationRisk: 22,
    gasCostUsd: 0.18,
    tvlChange24hPct: 2.7,
    drawdown30dPct: 4.8,
    sharpeEstimate: 1.62,
    auditStatus: "verified",
    lastSignal: "Yield spread widened while drawdown stayed controlled",
    evidence: [
      "mETH yield remains attractive relative to volatile LP positions",
      "Liquidity is deep enough for staged allocation changes",
      "Correlation risk is lower than concentrated DEX range exposure",
    ],
    protocolUrl: "https://meth.mantle.xyz/",
    tradeUrl: "https://meth.mantle.xyz/",
  },
  {
    id: "moe-range-watch",
    strategy: "Merchant Moe Range Watch",
    protocol: "Merchant Moe",
    asset: "MNT/USDe",
    category: "dex-liquidity",
    liquidityUsd: 910_000,
    volatilityBps: 760,
    yieldBps: 830,
    momentumScore: 61,
    concentrationRisk: 38,
    gasCostUsd: 0.24,
    tvlChange24hPct: -1.1,
    drawdown30dPct: 8.9,
    sharpeEstimate: 1.08,
    auditStatus: "monitored",
    lastSignal: "Fee velocity slowed while bin depth stayed healthy",
    evidence: [
      "Bin depth is sufficient but short-window fee velocity cooled",
      "Volatility suggests no immediate autonomous rebalance",
      "Operator review protects against range-chasing behavior",
    ],
    protocolUrl: "https://merchantmoe.com/",
    tradeUrl: "https://merchantmoe.com/trade",
  },
  {
    id: "usdy-defensive-sleeve",
    strategy: "USDY Defensive Sleeve",
    protocol: "RWA",
    asset: "USDY",
    category: "rwa-yield",
    liquidityUsd: 1_420_000,
    volatilityBps: 180,
    yieldBps: 510,
    momentumScore: 69,
    concentrationRisk: 17,
    gasCostUsd: 0.16,
    tvlChange24hPct: 0.8,
    drawdown30dPct: 2.1,
    sharpeEstimate: 1.84,
    auditStatus: "verified",
    lastSignal: "Stable yield profile improves portfolio drawdown protection",
    evidence: [
      "RWA sleeve reduces portfolio variance",
      "Lower volatility supports defensive allocation",
      "Yield is lower than LP routes but risk-adjusted score is strong",
    ],
    protocolUrl: "https://ondo.finance/",
    tradeUrl: "https://ondo.finance/usdy",
  },
  {
    id: "stable-route-sentinel",
    strategy: "Stable Route Sentinel",
    protocol: "Agni Finance",
    asset: "USDe/USDT",
    category: "stable-routing",
    liquidityUsd: 680_000,
    volatilityBps: 130,
    yieldBps: 240,
    momentumScore: 52,
    concentrationRisk: 25,
    gasCostUsd: 0.13,
    tvlChange24hPct: 0.2,
    drawdown30dPct: 1.4,
    sharpeEstimate: 0.91,
    auditStatus: "experimental",
    lastSignal: "Low volatility route can absorb defensive stable allocations",
    evidence: [
      "Stable route volatility is lowest in the current opportunity set",
      "Yield is modest, so the agent avoids over-allocating",
      "Useful as a safe harbor during higher DEX volatility",
    ],
    protocolUrl: "https://agni.finance/",
    tradeUrl: "https://agni.finance/swap",
  },
];

export const pipelineStages: PipelineStage[] = [
  {
    name: "Market intake",
    status: "complete",
    detail: "Pool, yield, volatility, and liquidity inputs normalized for Mantle.",
  },
  {
    name: "Agent reasoning",
    status: "complete",
    detail: "The policy engine scored risk, confidence, and recommended action.",
  },
  {
    name: "Execution guard",
    status: "active",
    detail: "High-risk recommendations require operator review before signing.",
  },
  {
    name: "On-chain registry",
    status: "queued",
    detail: "Approved decisions are formatted for StrategyDecisionRegistry.",
  },
];
