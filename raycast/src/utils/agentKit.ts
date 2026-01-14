import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address } from "viem";

export const createAgentKit = (privateKey: Address, network: "mainnet" | "testnet") => {
  return new MNTAgentKit(privateKey, network);
};
