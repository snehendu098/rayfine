import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export interface MethPosition {
  methBalance: bigint;
  wethBalance: bigint;
  wmntBalance: bigint;
  methTokenAddress: Address;
  wethTokenAddress: Address;
  wmntTokenAddress: Address;
}

export interface MethSwapResult {
  txHash: string;
}

export const getMethTokenAddress = (agent: MNTAgentKit): Address => {
  return agent.getMethTokenAddress();
};

export const methGetPosition = async (
  agent: MNTAgentKit,
  userAddress?: Address,
): Promise<MethPosition> => {
  return await agent.methGetPosition(userAddress);
};

export const swapToMeth = async (
  agent: MNTAgentKit,
  amount: string,
  slippage?: number,
): Promise<MethSwapResult> => {
  const txHash = await agent.swapToMeth(amount, slippage);
  return { txHash };
};

export const swapFromMeth = async (
  agent: MNTAgentKit,
  amount: string,
  slippage?: number,
): Promise<MethSwapResult> => {
  const txHash = await agent.swapFromMeth(amount, slippage);
  return { txHash };
};
