import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export interface LendleResult {
  txHash: string;
}

export interface LendleAccountData {
  totalCollateralETH: bigint;
  totalDebtETH: bigint;
  availableBorrowsETH: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

export interface LendlePosition {
  asset: Address;
  symbol: string;
  supplied: bigint;
  borrowed: bigint;
  suppliedUSD: string;
  borrowedUSD: string;
}

export interface LendlePositionsResult {
  positions: LendlePosition[];
  totalSupplied: bigint;
  totalDebt: bigint;
}

export const lendleSupply = async (
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
): Promise<LendleResult> => {
  const txHash = await agent.lendleSupply(tokenAddress, amount);
  return { txHash };
};

export const lendleWithdraw = async (
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  to?: Address,
): Promise<LendleResult> => {
  const txHash = await agent.lendleWithdraw(tokenAddress, amount, to);
  return { txHash };
};

export const lendleBorrow = async (
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  interestRateMode: 1 | 2 = 2,
  onBehalfOf?: Address,
): Promise<LendleResult> => {
  const txHash = await agent.lendleBorrow(tokenAddress, amount, interestRateMode, onBehalfOf);
  return { txHash };
};

export const lendleRepay = async (
  agent: MNTAgentKit,
  tokenAddress: Address,
  amount: string,
  rateMode: 1 | 2 = 2,
  onBehalfOf?: Address,
): Promise<LendleResult> => {
  const txHash = await agent.lendleRepay(tokenAddress, amount, rateMode, onBehalfOf);
  return { txHash };
};

export const lendleGetAccountData = async (
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<LendleAccountData> => {
  const data = await agent.lendleGetUserAccountData(userAddress);
  return data;
};

export const lendleGetPositions = async (
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<LendlePositionsResult> => {
  const data = await agent.lendleGetPositions(userAddress);
  return data;
};
