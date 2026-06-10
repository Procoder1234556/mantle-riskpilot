export type ProtocolProfile = {
  name: string;
  role: string;
  agentUse: string;
  riskSurface: string;
};

export const mantleProtocols: ProtocolProfile[] = [
  {
    name: "Mantle LSP / mETH",
    role: "Liquid staking and yield-bearing Mantle asset layer",
    agentUse: "Detects defensive staking routes and mETH allocation changes",
    riskSurface: "Liquidity, redemption pressure, and correlated market drawdown",
  },
  {
    name: "Merchant Moe",
    role: "Mantle-native DEX liquidity venue",
    agentUse: "Watches bin depth, fee velocity, and route quality before rebalancing",
    riskSurface: "Range drift, thin liquidity, and volatile fee concentration",
  },
  {
    name: "Agni Finance",
    role: "DEX route and stable-pair monitoring",
    agentUse: "Compares route quality for stable and MNT pairs",
    riskSurface: "Slippage, pool depth, and short-window volume changes",
  },
  {
    name: "USDY / RWA sleeve",
    role: "Real-world asset yield and defensive allocation",
    agentUse: "Allocates to lower-volatility yield when risk rises elsewhere",
    riskSurface: "Issuer, liquidity, and off-chain collateral assumptions",
  },
];
