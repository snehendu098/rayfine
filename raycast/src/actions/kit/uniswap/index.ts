import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export interface UniswapQuote {
  amountOut: string;
  priceImpact?: string;
}

export interface UniswapSwapResult {
  txHash: string;
}

export const getUniswapQuote = async (
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  amount: string,
): Promise<UniswapQuote> => {
  const quote = await agent.getUniswapQuote(fromToken, toToken, amount);
  return quote;
};

export const swapOnUniswap = async (
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage: number = 0.5,
): Promise<UniswapSwapResult> => {
  const txHash = await agent.swapOnUniswap(fromToken, toToken, amount, slippage);
  return { txHash };
};
