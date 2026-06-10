import React from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CircleDot,
  CheckCircle2,
  Gauge,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { mantleOpportunities, pipelineStages } from "./domain";
import { buildDecisionSet, summarizePortfolio } from "./riskEngine";
import "./styles.css";

const events = [
  "Scored Mantle opportunities from liquidity, volatility, yield, and concentration inputs",
  "Generated typed decision payloads for StrategyDecisionRegistry.sol",
  "Blocked high-risk actions behind an execution guard before signing",
];

function App() {
  const decisions = buildDecisionSet(mantleOpportunities);
  const summary = summarizePortfolio(decisions);

  return (
    <main>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">MR</div>
          <div>
            <strong>Mantle RiskPilot</strong>
            <span>AI strategy agent</span>
          </div>
        </div>
        <nav>
          <a className="active" href="#overview">
            <Gauge size={18} />
            Overview
          </a>
          <a href="#strategies">
            <Bot size={18} />
            Strategies
          </a>
          <a href="#registry">
            <ShieldCheck size={18} />
            Registry
          </a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mantle Turing Test Hackathon 2026</p>
            <h1>Autonomous DeFi risk decisions, ready for on-chain audit.</h1>
          </div>
          <button type="button" aria-label="Open contract registry">
            <ArrowUpRight size={18} />
          </button>
        </header>

        <section className="metrics" id="overview">
          <article>
            <Landmark size={20} />
            <span>Tracked Value</span>
            <strong>{summary.trackedValue}</strong>
          </article>
          <article>
            <Gauge size={20} />
            <span>Avg Risk</span>
            <strong>{summary.averageRisk}/100</strong>
          </article>
          <article>
            <CheckCircle2 size={20} />
            <span>Confidence</span>
            <strong>{summary.averageConfidence}%</strong>
          </article>
          <article>
            <WalletCards size={20} />
            <span>Review Queue</span>
            <strong>{summary.needsReview}</strong>
          </article>
        </section>

        <section className="panel-grid">
          <section className="strategy-list" id="strategies">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Agent recommendations</p>
                <h2>Strategy board</h2>
              </div>
            </div>
            {decisions.map((decision) => (
              <article className="strategy-card" key={decision.opportunityId}>
                <div>
                  <h3>{decision.strategy}</h3>
                  <p>{decision.protocol}</p>
                </div>
                <div className="pill">{decision.action.toLowerCase()}</div>
                <div className="bar">
                  <span style={{ width: `${decision.riskScore}%` }} />
                </div>
                <dl>
                  <div>
                    <dt>Confidence</dt>
                    <dd>{decision.confidence}%</dd>
                  </div>
                  <div>
                    <dt>Risk</dt>
                    <dd>{decision.riskScore}/100</dd>
                  </div>
                  <div>
                    <dt>Yield</dt>
                    <dd>{(decision.expectedYieldBps / 100).toFixed(2)}%</dd>
                  </div>
                </dl>
                <p className="signal">{decision.rationale[0]}</p>
              </article>
            ))}
          </section>

          <section className="registry" id="registry">
            <div className="section-heading">
              <div>
                <p className="eyebrow">On-chain record</p>
                <h2>Decision registry</h2>
              </div>
            </div>
            <div className="registry-box">
              <Activity size={28} />
              <h3>StrategyDecisionRegistry.sol</h3>
              <p>
                Each agent action can be written to Mantle with confidence,
                risk, strategy label, and rationale URI.
              </p>
              <code>recordDecision(strategy, action, confidence, risk, uri)</code>
            </div>
            <div className="pipeline">
              {pipelineStages.map((stage) => (
                <article className={`stage ${stage.status}`} key={stage.name}>
                  <CircleDot size={16} />
                  <div>
                    <strong>{stage.name}</strong>
                    <p>{stage.detail}</p>
                  </div>
                </article>
              ))}
            </div>
            <ol>
              {events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ol>
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
