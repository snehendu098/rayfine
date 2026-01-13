import { MNTAgentKit } from "mantle-agent-kit-sdk";
import { Address, PublicClient } from "viem";
import { getTokens, getTokenBalance, OpenOceanToken } from "../kit/openocean";

export interface TokenBalance {
  token: OpenOceanToken;
  balance: bigint;
  formatted: string;
  decimals: number;
}

const NATIVE_TOKEN: OpenOceanToken = {
  symbol: "MNT",
  name: "Mantle",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
};

const isNativeToken = (token: OpenOceanToken): boolean => {
  const addr = token.address.toLowerCase();
  return token.symbol === "MNT" || addr === NATIVE_TOKEN.address.toLowerCase() || addr === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
};

export async function getAssets(
  agent: MNTAgentKit,
  publicClient: PublicClient,
  userAddress: Address,
): Promise<TokenBalance[]> {
  const tokens = await getTokens(agent);

  // Filter out any native token from list, we add our own
  const erc20Tokens = tokens.filter((t) => !isNativeToken(t));
  const allTokens = [NATIVE_TOKEN, ...erc20Tokens];

  const balances = await Promise.all(
    allTokens.map(async (token) => {
      const addr = isNativeToken(token) ? "native" : (token.address as Address);
      const bal = await getTokenBalance(publicClient, addr, userAddress);
      return {
        token,
        balance: bal.balance,
        formatted: bal.formatted,
        decimals: bal.decimals,
      };
    }),
  );

  return balances.filter((b) => b.balance > 0n);
}
