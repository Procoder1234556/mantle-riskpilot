import type { AgentDecision, MantleOpportunity, PipelineStage } from "./domain";
import { scoreOpportunity } from "./riskEngine";

export type AgentRun = {
  id: string;
  startedAt: string;
  model: string;
  guardrail: string;
  stages: PipelineStage[];
  decisions: AgentDecision[];
  auditSummary: {
    approved: number;
    needsReview: number;
    blocked: number;
    highestRisk: number;
  };
};

export function runRiskPilotAgent(opportunities: MantleOpportunity[]): AgentRun {
  const decisions = opportunities
    .map(scoreOpportunity)
    .sort((a, b) => b.confidence - a.confidence || a.riskScore - b.riskScore);

  const blocked = decisions.filter((decision) => decision.riskScore >= 72).length;
  const needsReview = decisions.filter(
    (decision) => decision.riskScore >= 55 && decision.riskScore < 72,
  ).length;
  const approved = decisions.length - blocked - needsReview;
  const highestRisk = Math.max(...decisions.map((decision) => decision.riskScore));

  return {
    id: "run-mantle-2026-06-10",
    startedAt: "2026-06-10T11:30:00.000Z",
    model: "RiskPilot policy engine + LLM rationale layer",
    guardrail: "No transaction can be signed when risk score is 55+ without human approval.",
    stages: [
      {
        name: "Market intake",
        status: "complete",
        detail: "Normalized Mantle pools, RWA yield, liquidity depth, volatility, and concentration.",
      },
      {
        name: "AI reasoning",
        status: "complete",
        detail: "Generated strategy decisions with confidence, risk, and human-readable rationale.",
      },
      {
        name: "Risk gate",
        status: needsReview || blocked ? "active" : "complete",
        detail: "Operator approval required for medium/high-risk actions before execution.",
      },
      {
        name: "On-chain audit",
        status: "queued",
        detail: "Approved decisions are encoded for StrategyDecisionRegistry on Mantle.",
      },
    ],
    decisions,
    auditSummary: {
      approved,
      needsReview,
      blocked,
      highestRisk,
    },
  };
}

export function buildRationaleArtifact(decision: AgentDecision) {
  return {
    schema: "mantle-riskpilot.rationale.v1",
    opportunityId: decision.opportunityId,
    strategy: decision.strategy,
    action: decision.action,
    confidence: decision.confidence,
    riskScore: decision.riskScore,
    rationale: decision.rationale,
    registryPayload: decision.onchainPayload,
  };
}
