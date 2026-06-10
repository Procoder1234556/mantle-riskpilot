const MANTLE_PROJECT_HINTS = ["merchant", "agni", "mantle", "meth", "moe", "init"];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "mantle-riskpilot-mvp",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export default async function handler(_request, response) {
  try {
    const [chains, yields] = await Promise.all([
      fetchJson("https://api.llama.fi/v2/chains"),
      fetchJson("https://yields.llama.fi/pools"),
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
    const topPool =
      mantlePools[0] ?? yields.data.find((pool) => pool.chain.toLowerCase() === "mantle");

    response.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    response.status(200).json({
      source: "defillama",
      mantleTvlUsd: mantle?.tvl ?? null,
      topYieldApy: topPool?.apy ?? null,
      topYieldProject: topPool ? `${topPool.project} ${topPool.symbol}` : null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    response.status(503).json({
      source: "fallback",
      mantleTvlUsd: null,
      topYieldApy: null,
      topYieldProject: null,
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Live data unavailable",
    });
  }
}
