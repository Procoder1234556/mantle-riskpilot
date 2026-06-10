import React from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  FileText,
  Gauge,
  Landmark,
  Layers3,
  Lightbulb,
  Network,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import type { MantleOpportunity } from "./domain";
import { mantleOpportunities } from "./domain";
import { mantleProtocols } from "./mantleProtocols";
import { buildRationaleArtifact, runRiskPilotAgent } from "./agentWorkflow";
import { buildDecisionSet, summarizePortfolio } from "./riskEngine";
import { applySnapshotToOpportunities, fetchLiveSnapshot, type LiveSnapshot } from "./liveData";
import "./styles.css";

type Route = "landing" | "app" | "presentation";
type ReviewState = Record<string, "approved" | "rejected">;
type ActionFilter = "ALL" | "HOLD" | "MONITOR" | "REBALANCE" | "REDUCE" | "INCREASE";
type CategoryFilter = "all" | MantleOpportunity["category"];

const presentationSections = [
  "Executive Snapshot",
  "Problem",
  "Solution",
  "Architecture",
  "Mantle Fit",
  "Roadmap",
];

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
    currency: "USD",
  }).format(value);

const routeFromHash = (): Route => {
  if (window.location.hash === "#app") return "app";
  if (window.location.hash === "#presentation") return "presentation";
  return "landing";
};

function useRoute() {
  const [route, setRoute] = React.useState<Route>(routeFromHash);

  React.useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  return route;
}

function useLiveOpportunities() {
  const [live, setLive] = React.useState(true);
  const [tick, setTick] = React.useState(1);
  const [opportunities, setOpportunities] = React.useState(mantleOpportunities);
  const [snapshot, setSnapshot] = React.useState<LiveSnapshot>({
    source: "fallback",
    mantleTvlUsd: null,
    topYieldApy: null,
    topYieldProject: null,
    fetchedAt: new Date().toISOString(),
  });
  const [feed, setFeed] = React.useState([
    "Connected Mantle market stream",
    "Agent policy loaded",
    "Waiting for next risk cycle",
  ]);

  React.useEffect(() => {
    let cancelled = false;

    const refreshLiveData = async () => {
      try {
        const nextSnapshot = await fetchLiveSnapshot();
        if (cancelled) return;
        setSnapshot(nextSnapshot);
        setOpportunities((items) => applySnapshotToOpportunities(items, nextSnapshot));
        setFeed((items) => [
          `${new Date().toLocaleTimeString()} - DefiLlama sync: Mantle TVL ${formatUsd(
            nextSnapshot.mantleTvlUsd ?? 0,
          )}`,
          ...items,
        ].slice(0, 8));
      } catch {
        if (cancelled) return;
        setSnapshot((current) => ({ ...current, source: "fallback", fetchedAt: new Date().toISOString() }));
        setFeed((items) => [
          `${new Date().toLocaleTimeString()} - Public API unavailable, fallback stream active`,
          ...items,
        ].slice(0, 8));
      }
    };

    refreshLiveData();
    const timer = window.setInterval(refreshLiveData, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    if (!live) return undefined;

    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
      setOpportunities((items) =>
        items.map((item, index) => {
          const wave = Math.sin((Date.now() / 1400 + index * 1.8) % 6.28);
          const yieldDelta = Math.round(wave * 12 + (Math.random() - 0.5) * 18);
          const volatilityDelta = Math.round(-wave * 10 + (Math.random() - 0.5) * 28);
          const liquidityDelta = Math.round((Math.random() - 0.48) * 48_000);

          return {
            ...item,
            liquidityUsd: Math.max(420_000, item.liquidityUsd + liquidityDelta),
            volatilityBps: Math.max(90, item.volatilityBps + volatilityDelta),
            yieldBps: Math.max(120, item.yieldBps + yieldDelta),
            momentumScore: Math.min(95, Math.max(35, item.momentumScore + Math.round(wave * 2))),
            lastSignal:
              wave > 0.35
                ? "Live feed shows improving depth and fee momentum"
                : wave < -0.35
                  ? "Live feed shows cooling momentum and higher review pressure"
                  : item.lastSignal,
          };
        }),
      );
      setFeed((items) => {
        const protocols = ["Mantle LSP", "Merchant Moe", "Agni Finance", "RWA sleeve"];
        const messages = [
          "New volatility sample normalized",
          "Liquidity depth refreshed",
          "Agent reran risk policy",
          "Registry payload recalculated",
          "Execution guard checked review threshold",
        ];
        return [
          `${new Date().toLocaleTimeString()} - ${protocols[tick % protocols.length]}: ${
            messages[tick % messages.length]
          }`,
          ...items,
        ].slice(0, 8);
      });
    }, 2600);

    return () => window.clearInterval(timer);
  }, [live, tick]);

  return { feed, live, opportunities, setLive, snapshot, tick };
}

function App() {
  const route = useRoute();

  if (route === "app") {
    return (
      <Shell active="app">
        <Dashboard />
      </Shell>
    );
  }

  if (route === "presentation") {
    return (
      <Shell active="presentation">
        <Presentation />
      </Shell>
    );
  }

  return <LandingPage />;
}

function Shell({
  active,
  children,
}: {
  active: "app" | "presentation";
  children: React.ReactNode;
}) {
  return (
    <main>
      <aside className="sidebar">
        <a className="brand" href="#">
          <div className="brand-mark">MR</div>
          <div>
            <strong>Mantle RiskPilot</strong>
            <span>AI strategy agent</span>
          </div>
        </a>
        <nav>
          <a href="#">
            <Sparkles size={18} />
            Landing
          </a>
          <a className={active === "app" ? "active" : ""} href="#app">
            <Gauge size={18} />
            Live MVP
          </a>
          <a href="#app">
            <Bot size={18} />
            Agent Queue
          </a>
          <a className={active === "presentation" ? "active" : ""} href="#presentation">
            <FileText size={18} />
            Presentation
          </a>
        </nav>
      </aside>
      {children}
    </main>
  );
}

function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <a className="brand dark-brand" href="#">
          <div className="brand-mark">MR</div>
          <div>
            <strong>Mantle RiskPilot</strong>
            <span>Realtime DeFi agent MVP</span>
          </div>
        </a>
        <div>
          <a href="#presentation">Pitch</a>
          <a className="primary-link" href="#app">
            Launch MVP
            <ArrowRight size={17} />
          </a>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Mantle Turing Test Hackathon 2026</p>
          <h1>Realtime AI risk control for agentic DeFi on Mantle.</h1>
          <p>
            RiskPilot watches Mantle opportunities, updates risk scores live,
            queues agent decisions, and prepares every approved action for an
            auditable on-chain registry.
          </p>
          <div className="hero-actions">
            <a href="#app">Open live MVP</a>
            <a href="#presentation">View judge deck</a>
          </div>
        </div>

        <section className="live-preview" aria-label="Live product preview">
          <div className="preview-top">
            <span>
              <Radio size={16} />
              Live agent cycle
            </span>
            <strong>Running</strong>
          </div>
          <div className="preview-meter">
            <span style={{ width: "68%" }} />
          </div>
          <div className="preview-grid">
            <article>
              <span>Risk</span>
              <strong>42/100</strong>
            </article>
            <article>
              <span>Confidence</span>
              <strong>84%</strong>
            </article>
            <article>
              <span>Queue</span>
              <strong>2</strong>
            </article>
          </div>
          <ol>
            <li>mETH spread widened, risk gate approved staged rebalance</li>
            <li>Merchant Moe range cooled, moved to human review</li>
            <li>Registry payload created with evidence hash</li>
          </ol>
        </section>
      </section>

      <section className="landing-strip">
        <article>
          <ShieldCheck size={22} />
          <strong>Risk-gated execution</strong>
          <span>Agent actions are blocked, approved, or escalated before signing.</span>
        </article>
        <article>
          <Activity size={22} />
          <strong>Realtime signals</strong>
          <span>Liquidity, volatility, momentum, and yield refresh inside the MVP.</span>
        </article>
        <article>
          <Network size={22} />
          <strong>Mantle-native audit trail</strong>
          <span>Each decision maps to a Solidity registry payload.</span>
        </article>
      </section>
    </main>
  );
}

function Dashboard() {
  const { feed, live, opportunities, setLive, snapshot, tick } = useLiveOpportunities();
  const [reviews, setReviews] = React.useState<ReviewState>({});
  const [actionFilter, setActionFilter] = React.useState<ActionFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all");
  const [riskLimit, setRiskLimit] = React.useState(58);
  const [selectedId, setSelectedId] = React.useState(mantleOpportunities[0].id);
  const [allocationUsd, setAllocationUsd] = React.useState(25_000);
  const decisions = React.useMemo(() => buildDecisionSet(opportunities), [opportunities]);
  const filteredDecisions = React.useMemo(
    () =>
      decisions.filter((decision) => {
        const source = opportunities.find((item) => item.id === decision.opportunityId);
        const actionMatch = actionFilter === "ALL" || decision.action === actionFilter;
        const categoryMatch = categoryFilter === "all" || source?.category === categoryFilter;
        const riskMatch = decision.riskScore <= riskLimit;
        return actionMatch && categoryMatch && riskMatch;
      }),
    [actionFilter, categoryFilter, decisions, opportunities, riskLimit],
  );
  const agentRun = React.useMemo(() => runRiskPilotAgent(opportunities), [opportunities]);
  const summary = summarizePortfolio(decisions);
  const selectedDecision =
    decisions.find((decision) => decision.opportunityId === selectedId) ?? decisions[0];
  const selectedSource = opportunities.find((item) => item.id === selectedDecision.opportunityId)!;
  const artifact = buildRationaleArtifact(selectedDecision);
  const approvedCount = Object.values(reviews).filter((state) => state === "approved").length;
  const rejectedCount = Object.values(reviews).filter((state) => state === "rejected").length;
  const projectedYieldUsd = Math.round((allocationUsd * selectedDecision.expectedYieldBps) / 10_000);
  const maxAutopilot = Math.max(0, Math.round(allocationUsd * (1 - selectedDecision.riskScore / 130)));

  const reviewDecision = (id: string, state: "approved" | "rejected") => {
    setReviews((current) => ({ ...current, [id]: state }));
  };

  return (
    <section className="workspace">
      <header className="topbar app-topbar">
        <div>
          <p className="eyebrow">Live MVP dashboard</p>
          <h1>Realtime Mantle strategy control room.</h1>
          <p className="topbar-copy">
            Simulated live market stream, agent risk loop, review queue, and
            on-chain-ready registry payloads in one operator surface.
          </p>
        </div>
        <button className="live-toggle" type="button" onClick={() => setLive(!live)}>
          {live ? <Pause size={17} /> : <Play size={17} />}
          {live ? "Pause stream" : "Resume stream"}
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
          <Clock3 size={20} />
          <span>Live Cycle</span>
          <strong>#{tick}</strong>
        </article>
      </section>

      <section className="source-strip">
        <article>
          <span>Data source</span>
          <strong>{snapshot.source === "defillama" ? "DefiLlama live" : "Fallback stream"}</strong>
        </article>
        <article>
          <span>Mantle TVL</span>
          <strong>{snapshot.mantleTvlUsd ? formatUsd(snapshot.mantleTvlUsd) : "Syncing"}</strong>
        </article>
        <article>
          <span>Yield context</span>
          <strong>{snapshot.topYieldProject ?? "Mantle opportunity model"}</strong>
        </article>
        <article>
          <span>Last sync</span>
          <strong>{new Date(snapshot.fetchedAt).toLocaleTimeString()}</strong>
        </article>
      </section>

      <section className="control-surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Interactive policy controls</p>
            <h2>Shape the agent run</h2>
          </div>
          <SlidersHorizontal size={22} />
        </div>
        <div className="controls-grid">
          <label>
            <span>Action filter</span>
            <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value as ActionFilter)}>
              <option value="ALL">All actions</option>
              <option value="REBALANCE">Rebalance</option>
              <option value="INCREASE">Increase</option>
              <option value="MONITOR">Monitor</option>
              <option value="REDUCE">Reduce</option>
              <option value="HOLD">Hold</option>
            </select>
          </label>
          <label>
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            >
              <option value="all">All categories</option>
              <option value="liquid-staking">Liquid staking</option>
              <option value="dex-liquidity">DEX liquidity</option>
              <option value="rwa-yield">RWA yield</option>
              <option value="stable-routing">Stable routing</option>
            </select>
          </label>
          <label>
            <span>Max auto-risk: {riskLimit}/100</span>
            <input
              max="95"
              min="15"
              type="range"
              value={riskLimit}
              onChange={(event) => setRiskLimit(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Test allocation</span>
            <input
              min="1000"
              step="1000"
              type="number"
              value={allocationUsd}
              onChange={(event) => setAllocationUsd(Number(event.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="live-layout">
        <section className="strategy-list" id="strategies">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Realtime agent recommendations</p>
              <h2>Strategy board</h2>
            </div>
            <span className={live ? "status-dot online" : "status-dot"}>
              {filteredDecisions.length} visible
            </span>
          </div>

          {filteredDecisions.map((decision) => {
            const source = opportunities.find((item) => item.id === decision.opportunityId)!;
            const reviewState = reviews[decision.opportunityId];
            const selected = decision.opportunityId === selectedDecision.opportunityId;

            return (
              <article
                className={`strategy-card dynamic-card ${selected ? "selected-card" : ""}`}
                key={decision.opportunityId}
                onClick={() => setSelectedId(decision.opportunityId)}
              >
                <div>
                  <h3>{decision.strategy}</h3>
                  <p>
                    {decision.protocol} - {source.asset} - {formatUsd(source.liquidityUsd)} liquidity
                  </p>
                </div>
                <div className={`pill ${decision.action.toLowerCase()}`}>
                  {reviewState ?? decision.action.toLowerCase()}
                </div>
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
                  <div>
                    <dt>Volatility</dt>
                    <dd>{source.volatilityBps} bps</dd>
                  </div>
                </dl>
                <p className="signal">{decision.rationale[0]}</p>
                <div className="review-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      reviewDecision(decision.opportunityId, "approved");
                    }}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      reviewDecision(decision.opportunityId, "rejected");
                    }}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </article>
            );
          })}

          {filteredDecisions.length === 0 ? (
            <article className="empty-state">
              <strong>No strategies match this policy.</strong>
              <span>Raise the risk threshold or change filters to widen the agent queue.</span>
            </article>
          ) : null}
        </section>

        <aside className="operator-panel">
          <section className="registry detail-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected strategy</p>
                <h2>{selectedDecision.strategy}</h2>
              </div>
            </div>
            <div className="selected-meter">
              <span style={{ width: `${selectedDecision.confidence}%` }} />
            </div>
            <dl>
              <div>
                <dt>Protocol</dt>
                <dd>{selectedDecision.protocol}</dd>
              </div>
              <div>
                <dt>Asset</dt>
                <dd>{selectedSource.asset}</dd>
              </div>
              <div>
                <dt>Projected Yield</dt>
                <dd>{formatUsd(projectedYieldUsd)}</dd>
              </div>
              <div>
                <dt>Autopilot Cap</dt>
                <dd>{formatUsd(maxAutopilot)}</dd>
              </div>
            </dl>
            <ul>
              {selectedDecision.rationale.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="registry">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Review queue</p>
                <h2>Operator state</h2>
              </div>
            </div>
            <div className="queue-stats">
              <article>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </article>
              <article>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </article>
              <article>
                <span>Pending</span>
                <strong>{decisions.length - approvedCount - rejectedCount}</strong>
              </article>
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
          </section>

          <section className="registry live-feed">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Realtime stream</p>
                <h2>Agent events</h2>
              </div>
            </div>
            <ol>
              {feed.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ol>
          </section>
        </aside>
      </section>

      <section className="panel-grid registry-row" id="registry">
        <section className="registry">
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
              Approved agent actions are formatted for Mantle with confidence,
              risk, strategy label, rationale URI, and evidence hash.
            </p>
            <code>recordDecision(strategy, action, confidence, risk, uri, evidenceHash)</code>
          </div>
        </section>

        <section className="registry artifact">
          <p className="eyebrow">Live rationale artifact</p>
          <pre>{JSON.stringify(artifact, null, 2)}</pre>
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
          <a href="#app">Open live MVP</a>
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
                <p>Landing page, live MVP, risk engine, registry contract, and Vercel deployment.</p>
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
