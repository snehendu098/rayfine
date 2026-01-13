import { useState, useEffect, useCallback, useMemo } from "react";
import { List, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { getAssets, TokenBalance } from "./actions/mantle/tokens";

function TokenBalancesList() {
  const { account, publicClient, privateKey, isLoading: walletLoading } = useWalletContext();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const loadBalances = useCallback(async () => {
    if (!agent || !account || !publicClient) return;
    try {
      setIsLoading(true);
      const assets = await getAssets(agent, publicClient, account.address);
      setBalances(assets);
    } catch (err) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load balances" });
    } finally {
      setIsLoading(false);
    }
  }, [agent, account, publicClient]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const formatBalance = (formatted: string): string => {
    const num = parseFloat(formatted);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    return num.toFixed(4);
  };

  return (
    <List isLoading={walletLoading || isLoading}>
      {balances.length > 0 && (
        <List.Section title="Token Balances">
          {balances.map((b, idx) => (
            <List.Item
              key={idx}
              icon={Icon.Coins}
              title={b.token.symbol}
              subtitle={b.token.name}
              accessories={[{ text: formatBalance(b.formatted) }]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser
                    title="View on Explorer"
                    url={`https://mantlescan.xyz/token/${b.token.address}`}
                  />
                  <Action.CopyToClipboard title="Copy Address" content={b.token.address} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {balances.length === 0 && !isLoading && !walletLoading && (
        <List.EmptyView icon={Icon.Tray} title="No Tokens" description="No tokens with balance found." />
      )}
    </List>
  );
}

export default function TokenBalances() {
  return (
    <WalletProvider>
      <RequireWallet>
        <TokenBalancesList />
      </RequireWallet>
    </WalletProvider>
  );
}
