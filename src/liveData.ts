import type { MantleOpportunity } from "./domain";

type ChainRecord = {
  name: string;
  tvl: number;
};

type YieldPool = {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyPct1D?: number;
  apyPct7D?: number;
  sigma?: number;
};

type YieldResponse = {
  status: string;
  data: YieldPool[];
};

export type LiveSnapshot = {
  source: "defillama" | "fallback";
  mantleTvlUsd: number | null;
  topYieldApy: number | null;
  topYieldProject: string | null;
  fetchedAt: string;
};

const MANTLE_PROJECT_HINTS = ["merchant", "agni", "mantle", "meth", "moe", "init"];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchLiveSnapshot(): Promise<LiveSnapshot> {
  const [chains, yields] = await Promise.all([
    fetchJson<ChainRecord[]>("https://api.llama.fi/v2/chains"),
    fetchJson<YieldResponse>("https://yields.llama.fi/pools"),
  ]);

  const mantle = chains.find((chain) => chain.name.toLowerCase() === "mantle");
  const mantlePools = yields.data
    .filter((pool) => pool.chain.toLowerCase() === "mantle")
    .filter((pool) =>
      MANTLE_PROJECT_HINTS.some((hint) =>
        `${pool.project} ${pool.symbol}`.toLowerCase().includes(hint),
      ),
    )
    .sort((a, b) => b.tvlUsd - a.tvlUsd);
  const topPool = mantlePools[0] ?? yields.data.find((pool) => pool.chain.toLowerCase() === "mantle");

  return {
    source: "defillama",
    mantleTvlUsd: mantle?.tvl ?? null,
    topYieldApy: topPool?.apy ?? null,
    topYieldProject: topPool ? `${topPool.project} ${topPool.symbol}` : null,
    fetchedAt: new Date().toISOString(),
  };
}

export function applySnapshotToOpportunities(
  items: MantleOpportunity[],
  snapshot: LiveSnapshot | null,
): MantleOpportunity[] {
  if (!snapshot || snapshot.source !== "defillama") return items;

  const tvlMultiplier = snapshot.mantleTvlUsd
    ? Math.min(1.6, Math.max(0.65, snapshot.mantleTvlUsd / 156_000_000))
    : 1;
  const yieldBoost = snapshot.topYieldApy ? Math.round(snapshot.topYieldApy * 10) : 0;

  return items.map((item, index) => {
    const isYieldSensitive = item.category === "liquid-staking" || item.category === "dex-liquidity";
    const liveYield = isYieldSensitive ? yieldBoost + index * 7 : Math.round(yieldBoost * 0.45);

    return {
      ...item,
      liquidityUsd: Math.round(item.liquidityUsd * tvlMultiplier),
      yieldBps: Math.max(120, item.yieldBps + liveYield),
      lastSignal: snapshot.topYieldProject
        ? `DefiLlama live feed: ${snapshot.topYieldProject} is driving Mantle yield context`
        : `DefiLlama live feed refreshed Mantle TVL at ${snapshot.mantleTvlUsd ?? "unknown"}`,
    };
  });
}
