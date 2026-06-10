import type { AgentAction, AgentDecision, MantleOpportunity } from "./domain";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toBps = (percent: number) => Math.round(clamp(percent, 0, 100) * 100);

function chooseAction(riskScore: number, yieldBps: number, momentumScore: number): AgentAction {
  if (riskScore >= 72) return "REDUCE";
  if (riskScore >= 55) return "MONITOR";
  if (yieldBps >= 650 && momentumScore >= 70) return "REBALANCE";
  if (riskScore <= 28 && yieldBps >= 450) return "INCREASE";
  return "HOLD";
}

function buildRationale(item: MantleOpportunity, riskScore: number, confidence: number): string[] {
  const notes = [
    item.lastSignal,
    `Risk score ${riskScore}/100 reflects volatility at ${item.volatilityBps} bps and concentration at ${item.concentrationRisk}/100.`,
    `Confidence ${confidence}% is based on liquidity depth, momentum, and yield stability.`,
  ];

  if (item.liquidityUsd < 750_000) {
    notes.push("Liquidity is below the preferred execution threshold, so the agent limits action size.");
  }

  if (item.category === "rwa-yield") {
    notes.push("RWA exposure is treated as a defensive sleeve instead of a high-frequency trading route.");
  }

  return notes;
}

export function scoreOpportunity(item: MantleOpportunity): AgentDecision {
  const liquidityScore = clamp(100 - item.liquidityUsd / 45_000, 0, 35);
  const volatilityScore = clamp(item.volatilityBps / 25, 0, 35);
  const concentrationScore = clamp(item.concentrationRisk * 0.3, 0, 30);
  const riskScore = Math.round(liquidityScore + volatilityScore + concentrationScore);
  const confidence = Math.round(
    clamp(72 + item.momentumScore * 0.22 + item.yieldBps / 120 - riskScore * 0.28, 45, 94),
  );
  const action = chooseAction(riskScore, item.yieldBps, item.momentumScore);
  const rationale = buildRationale(item, riskScore, confidence);

  return {
    opportunityId: item.id,
    strategy: item.strategy,
    protocol: item.protocol,
    action,
    confidence,
    riskScore,
    expectedYieldBps: item.yieldBps,
    rationale,
    onchainPayload: {
      strategy: item.strategy,
      action,
      confidenceBps: toBps(confidence),
      riskBps: toBps(riskScore),
      rationaleUri: `ipfs://mantle-riskpilot/${item.id}.json`,
    },
  };
}

export function buildDecisionSet(items: MantleOpportunity[]) {
  return items
    .map(scoreOpportunity)
    .sort((a, b) => b.confidence - a.confidence || a.riskScore - b.riskScore);
}

export function summarizePortfolio(decisions: AgentDecision[]) {
  const averageRisk = Math.round(
    decisions.reduce((total, decision) => total + decision.riskScore, 0) / decisions.length,
  );
  const averageConfidence = Math.round(
    decisions.reduce((total, decision) => total + decision.confidence, 0) / decisions.length,
  );
  const approved = decisions.filter((decision) => decision.riskScore < 55).length;

  return {
    trackedValue: "$5.8M",
    averageRisk,
    averageConfidence,
    approved,
    needsReview: decisions.length - approved,
  };
}
