import { mantle, mantleSepoliaTestnet } from "viem/chains";

// export type Network = "mainnet" | "testnet";

export type Network = typeof mantle | typeof mantleSepoliaTestnet;
