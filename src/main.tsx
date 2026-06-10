import React from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FileText,
  Gauge,
  Landmark,
  Layers3,
  Lightbulb,
  Network,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { mantleOpportunities } from "./domain";
import { mantleProtocols } from "./mantleProtocols";
import { buildRationaleArtifact, runRiskPilotAgent } from "./agentWorkflow";
import { summarizePortfolio } from "./riskEngine";
import "./styles.css";

const events = [
  "Scored Mantle opportunities from liquidity, volatility, yield, and concentration inputs",
  "Generated typed decision payloads for StrategyDecisionRegistry.sol",
  "Blocked high-risk actions behind an execution guard before signing",
];

const presentationSections = [
  "Executive Snapshot",
  "Problem",
  "Solution",
  "Architecture",
  "Mantle Fit",
  "Roadmap",
];

function Shell({ children }: { children: React.ReactNode }) {
  const isPresentation = window.location.hash === "#presentation";

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
          <a className={!isPresentation ? "active" : ""} href="#overview">
            <Gauge size={18} />
            Dashboard
          </a>
          <a href="#strategies">
            <Bot size={18} />
            Strategies
          </a>
          <a href="#registry">
            <ShieldCheck size={18} />
            Registry
          </a>
          <a className={isPresentation ? "active" : ""} href="#presentation">
            <FileText size={18} />
            Presentation
          </a>
        </nav>
      </aside>
      {children}
    </main>
  );
}

function App() {
  const [, forceRender] = React.useReducer((value: number) => value + 1, 0);

  React.useEffect(() => {
    window.addEventListener("hashchange", forceRender);
    return () => window.removeEventListener("hashchange", forceRender);
  }, []);

  if (window.location.hash === "#presentation") {
    return (
      <Shell>
        <Presentation />
      </Shell>
    );
  }

  const agentRun = runRiskPilotAgent(mantleOpportunities);
  const decisions = agentRun.decisions;
  const summary = summarizePortfolio(decisions);
  const topDecision = decisions[0];
  const artifact = buildRationaleArtifact(topDecision);

  return (
    <Shell>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mantle Turing Test Hackathon 2026</p>
            <h1>Autonomous DeFi risk decisions, ready for on-chain audit.</h1>
          </div>
          <a className="icon-button" href="#presentation" aria-label="Open presentation">
            <ArrowUpRight size={18} />
          </a>
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
                risk, strategy label, rationale URI, and evidence hash.
              </p>
              <code>recordDecision(strategy, action, confidence, risk, uri, evidenceHash)</code>
            </div>
            <div className="pipeline">
              {agentRun.stages.map((stage) => (
                <article className={`stage ${stage.status}`} key={stage.name}>
                  <CircleDot size={16} />
                  <div>
                    <strong>{stage.name}</strong>
                    <p>{stage.detail}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="artifact">
              <p className="eyebrow">Sample rationale artifact</p>
              <pre>{JSON.stringify(artifact, null, 2)}</pre>
            </div>
            <ol>
              {events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ol>
          </section>
        </section>

        <section className="protocols">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Mantle ecosystem fit</p>
              <h2>Protocol intelligence map</h2>
            </div>
          </div>
          <div className="protocol-grid">
            {mantleProtocols.map((protocol) => (
              <article key={protocol.name}>
                <h3>{protocol.name}</h3>
                <p>{protocol.role}</p>
                <dl>
                  <div>
                    <dt>Agent use</dt>
                    <dd>{protocol.agentUse}</dd>
                  </div>
                  <div>
                    <dt>Risk surface</dt>
                    <dd>{protocol.riskSurface}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </Shell>
  );
}

function Presentation() {
  return (
    <section className="workspace presentation-page">
      <header className="presentation-hero">
        <p className="eyebrow">Judge presentation</p>
        <h1>Mantle RiskPilot</h1>
        <p>
          An AI DeFi strategy agent that turns Mantle market signals into
          explainable decisions, risk-gated actions, and auditable on-chain
          registry records.
        </p>
        <div className="hero-actions">
          <a href="#overview">Open product demo</a>
          <a href="https://github.com/Procoder1234556/mantle-riskpilot">GitHub repo</a>
        </div>
      </header>

      <section className="notion-layout">
        <aside className="toc">
          <strong>Contents</strong>
          {presentationSections.map((section) => (
            <a href={`#${section.toLowerCase().replace(/\s+/g, "-")}`} key={section}>
              {section}
            </a>
          ))}
        </aside>

        <article className="notion-doc">
          <section id="executive-snapshot">
            <h2>Executive Snapshot</h2>
            <div className="callout">
              <Sparkles size={22} />
              <p>
                RiskPilot is the accountability layer for agentic DeFi: before
                an AI agent signs or recommends a strategy, it must explain the
                data, risk score, confidence, and evidence hash.
              </p>
            </div>
            <div className="doc-grid">
              <div>
                <strong>Track</strong>
                <span>AI Trading & Strategy / AI DevTools</span>
              </div>
              <div>
                <strong>Network</strong>
                <span>Mantle Sepolia and Mantle Mainnet target</span>
              </div>
              <div>
                <strong>Core primitive</strong>
                <span>StrategyDecisionRegistry.sol</span>
              </div>
            </div>
          </section>

          <section id="problem">
            <h2>Problem</h2>
            <p>
              AI trading agents can move faster than human reviewers, but most
              dashboards hide the reasoning trail. That creates a trust gap for
              DeFi users, liquidity managers, and protocol teams who need to
              know why capital moved before they approve execution.
            </p>
          </section>

          <section id="solution">
            <h2>Solution</h2>
            <div className="feature-list">
              <article>
                <Lightbulb size={20} />
                <strong>Explainable agent recommendations</strong>
                <p>Every strategy emits rationale, confidence, and risk score.</p>
              </article>
              <article>
                <ShieldCheck size={20} />
                <strong>Execution guard</strong>
                <p>High-risk opportunities move to review instead of auto-execution.</p>
              </article>
              <article>
                <ClipboardList size={20} />
                <strong>On-chain audit trail</strong>
                <p>Decision payloads are ready for Mantle registry recording.</p>
              </article>
            </div>
          </section>

          <section id="architecture">
            <h2>Architecture</h2>
            <div className="architecture">
              <div>Market intake</div>
              <span />
              <div>AI scoring</div>
              <span />
              <div>Risk gate</div>
              <span />
              <div>Mantle registry</div>
            </div>
            <p>
              The frontend demonstrates the complete operator flow, while the
              Solidity registry defines how each AI decision can be anchored to
              Mantle with a rationale URI and evidence hash.
            </p>
          </section>

          <section id="mantle-fit">
            <h2>Mantle Fit</h2>
            <p>
              The agent model is tuned around Mantle DeFi primitives including
              mETH liquidity, Merchant Moe ranges, Agni routing, and RWA-style
              defensive sleeves. The project is designed to become a reusable
              safety layer for any Mantle agent that recommends capital movement.
            </p>
          </section>

          <section id="roadmap">
            <h2>Roadmap</h2>
            <div className="timeline">
              <article>
                <Network size={18} />
                <strong>Hackathon demo</strong>
                <p>Dashboard, risk engine, registry contract, and Vercel deployment.</p>
              </article>
              <article>
                <Layers3 size={18} />
                <strong>Mantle deployment</strong>
                <p>Deploy registry to Mantle testnet and publish verified address.</p>
              </article>
              <article>
                <WalletCards size={18} />
                <strong>Agent execution</strong>
                <p>Connect wallet signing, quote routes, and policy controls.</p>
              </article>
            </div>
          </section>
        </article>
      </section>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
