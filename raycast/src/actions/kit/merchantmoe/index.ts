import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export interface MerchantMoeSwapResult {
  txHash: string;
}

export const executeMerchantMoeSwap = async (
  agent: MNTAgentKit,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  slippagePercent: number = 0.5,
): Promise<MerchantMoeSwapResult> => {
  const txHash = await agent.merchantMoeSwap(tokenIn, tokenOut, amountIn, slippagePercent);
  return { txHash };
};
