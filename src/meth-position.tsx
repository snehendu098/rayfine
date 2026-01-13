import { useState, useEffect, useCallback, useMemo } from "react";
import { List, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { methGetPosition, getMethTokenAddress, MethPosition } from "./actions/kit/meth";
import { formatUnits } from "viem";

function MethPositionList() {
  const { account, privateKey, isLoading: walletLoading } = useWalletContext();

  const [position, setPosition] = useState<MethPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const methAddress = useMemo(() => {
    if (!agent) return null;
    return getMethTokenAddress(agent);
  }, [agent]);

  const loadData = useCallback(async () => {
    if (!agent || !account) return;
    try {
      setIsLoading(true);
      const pos = await methGetPosition(agent);
      setPosition(pos);
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load position" });
    } finally {
      setIsLoading(false);
    }
  }, [agent, account]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatBalance = (value: bigint): string => {
    return parseFloat(formatUnits(value, 18)).toFixed(6);
  };

  return (
    <List isLoading={walletLoading || isLoading}>
      <List.Section title="mETH Position">
        <List.Item
          icon={Icon.Coins}
          title="mETH Balance"
          accessories={[{ text: position ? formatBalance(position.methBalance) : "0" }]}
          actions={
            <ActionPanel>
              {methAddress && (
                <Action.OpenInBrowser
                  title="View mETH on Explorer"
                  url={`https://mantlescan.xyz/token/${methAddress}`}
                />
              )}
            </ActionPanel>
          }
        />
        <List.Item
          icon={Icon.Coins}
          title="WETH Balance"
          accessories={[{ text: position ? formatBalance(position.wethBalance) : "0" }]}
          actions={
            <ActionPanel>
              {position && (
                <Action.OpenInBrowser
                  title="View WETH on Explorer"
                  url={`https://mantlescan.xyz/token/${position.wethTokenAddress}`}
                />
              )}
            </ActionPanel>
          }
        />
        <List.Item
          icon={Icon.Coins}
          title="WMNT Balance"
          accessories={[{ text: position ? formatBalance(position.wmntBalance) : "0" }]}
          actions={
            <ActionPanel>
              {position && (
                <Action.OpenInBrowser
                  title="View WMNT on Explorer"
                  url={`https://mantlescan.xyz/token/${position.wmntTokenAddress}`}
                />
              )}
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Token Addresses">
        {methAddress && (
          <List.Item
            icon={Icon.Link}
            title="mETH"
            subtitle={methAddress}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard title="Copy Address" content={methAddress} />
                <Action.OpenInBrowser
                  title="View on Explorer"
                  url={`https://mantlescan.xyz/token/${methAddress}`}
                />
              </ActionPanel>
            }
          />
        )}
        {position && (
          <>
            <List.Item
              icon={Icon.Link}
              title="WETH"
              subtitle={position.wethTokenAddress}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Copy Address" content={position.wethTokenAddress} />
                  <Action.OpenInBrowser
                    title="View on Explorer"
                    url={`https://mantlescan.xyz/token/${position.wethTokenAddress}`}
                  />
                </ActionPanel>
              }
            />
            <List.Item
              icon={Icon.Link}
              title="WMNT"
              subtitle={position.wmntTokenAddress}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Copy Address" content={position.wmntTokenAddress} />
                  <Action.OpenInBrowser
                    title="View on Explorer"
                    url={`https://mantlescan.xyz/token/${position.wmntTokenAddress}`}
                  />
                </ActionPanel>
              }
            />
          </>
        )}
      </List.Section>
    </List>
  );
}

export default function MethPosition() {
  return (
    <WalletProvider>
      <RequireWallet>
        <MethPositionList />
      </RequireWallet>
    </WalletProvider>
  );
}
