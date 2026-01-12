import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address, PublicClient, erc20Abi, formatUnits } from "viem";

export interface OpenOceanToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export interface SwapQuote {
  inToken: { symbol: string; decimals: number };
  outToken: { symbol: string; decimals: number };
  inAmount: string;
  outAmount: string;
}

export interface SwapResult {
  txHash: string;
  outAmount: string;
  outDecimals: number;
}

export const getTokens = async (agent: MNTAgentKit): Promise<OpenOceanToken[]> => {
  const tokens = await agent.getOpenOceanTokens();
  return tokens;
};

export const getQuote = async (
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  amount: string,
): Promise<SwapQuote> => {
  const quote = await agent.getOpenOceanQuote(fromToken, toToken, amount);
  return quote;
};

export const executeSwap = async (
  agent: MNTAgentKit,
  fromToken: Address,
  toToken: Address,
  amount: string,
  slippage: number,
): Promise<SwapResult> => {
  const result = await agent.swapOnOpenOcean(fromToken, toToken, amount, slippage);
  return {
    txHash: result.txHash,
    outAmount: result.outAmount,
    outDecimals: 18,
  };
};

export const getTokenBalance = async (
  publicClient: PublicClient,
  tokenAddress: Address | "native",
  userAddress: Address,
): Promise<{ balance: bigint; formatted: string; decimals: number }> => {
  if (tokenAddress === "native") {
    const balance = await publicClient.getBalance({ address: userAddress });
    return { balance, formatted: formatUnits(balance, 18), decimals: 18 };
  }

  const [balance, decimals] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress],
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);

  return {
    balance: balance as bigint,
    formatted: formatUnits(balance as bigint, decimals as number),
    decimals: decimals as number,
  };
};
