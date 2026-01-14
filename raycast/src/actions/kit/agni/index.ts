import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export interface AgniSwapResult {
  txHash: string;
}

export const executeAgniSwap = async (
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
  feeTier?: number,
): Promise<AgniSwapResult> => {
  const txHash = await agent.agniSwap(tokenIn, tokenOut, amountIn, slippagePercent, feeTier);
  return { txHash };
};
