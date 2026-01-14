import { MNTAgentKit } from "mantle-agent-kit-sdk";

export interface PythPriceResult {
  priceFeedId: string;
  pair: string;
  price: string;
  confidence: string;
  exponent: number;
  publishTime: number;
  formattedPrice: string;
}

export const METH_TOKEN_ADDRESS = "0xcDA86A272531e8640cD7F1a92c01839911B90bb0";

export const pythGetPrice = async (
  agent: MNTAgentKit,
  pairOrAddress: string,
): Promise<PythPriceResult> => {
  // Handle mETH alias
  const input = pairOrAddress.toUpperCase() === "METH" ? METH_TOKEN_ADDRESS : pairOrAddress;
  return await agent.pythGetPrice(input);
};
