import { useState, useEffect, useCallback, useMemo } from "react";
import { List, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { lendleGetAccountData, lendleGetPositions, LendleAccountData, LendlePositionsResult } from "./actions/kit/lendle";
import { formatUnits } from "viem";

function LendlePositionsList() {
  const { account, privateKey, isLoading: walletLoading } = useWalletContext();

  const [accountData, setAccountData] = useState<LendleAccountData | null>(null);
  const [positionsData, setPositionsData] = useState<LendlePositionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const loadData = useCallback(async () => {
    if (!agent || !account) return;
    try {
      setIsLoading(true);
      const [accData, posData] = await Promise.all([
        lendleGetAccountData(agent),
        lendleGetPositions(agent),
      ]);
      setAccountData(accData);
      setPositionsData(posData);
    } catch (err) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load positions" });
    } finally {
      setIsLoading(false);
    }
  }, [agent, account]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatBigInt = (value: bigint, decimals = 18): string => {
    return parseFloat(formatUnits(value, decimals)).toFixed(4);
  };

  const healthFactorColor = (hf: bigint): string => {
    const val = parseFloat(formatUnits(hf, 18));
    if (val >= 2) return "Good";
    if (val >= 1.5) return "Moderate";
    if (val >= 1) return "Low";
    return "Liquidation Risk";
  };

  return (
    <List isLoading={walletLoading || isLoading}>
      {accountData && (
        <List.Section title="Account Summary">
          <List.Item
            icon={Icon.Heart}
            title="Health Factor"
            subtitle={healthFactorColor(accountData.healthFactor)}
            accessories={[{ text: formatBigInt(accountData.healthFactor) }]}
          />
          <List.Item
            icon={Icon.Coins}
            title="Total Collateral"
            accessories={[{ text: `${formatBigInt(accountData.totalCollateralETH)} ETH` }]}
          />
          <List.Item
            icon={Icon.BankNote}
            title="Total Debt"
            accessories={[{ text: `${formatBigInt(accountData.totalDebtETH)} ETH` }]}
          />
          <List.Item
            icon={Icon.ArrowRight}
            title="Available to Borrow"
            accessories={[{ text: `${formatBigInt(accountData.availableBorrowsETH)} ETH` }]}
          />
          <List.Item
            icon={Icon.BarChart}
            title="LTV"
            accessories={[{ text: `${formatBigInt(accountData.ltv, 2)}%` }]}
          />
        </List.Section>
      )}

      {positionsData && positionsData.positions.length > 0 && (
        <List.Section title="Positions">
          {positionsData.positions.map((pos, idx) => (
            <List.Item
              key={idx}
              icon={Icon.Dot}
              title={pos.symbol}
              subtitle={`Supplied: ${pos.suppliedUSD} | Borrowed: ${pos.borrowedUSD}`}
              accessories={[{ text: pos.asset.slice(0, 8) + "..." }]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser
                    title="View Token on Explorer"
                    url={`https://mantlescan.xyz/token/${pos.asset}`}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {positionsData && positionsData.positions.length === 0 && !isLoading && (
        <List.EmptyView
          icon={Icon.Tray}
          title="No Positions"
          description="You don't have any positions on Lendle yet."
        />
      )}
    </List>
  );
}

export default function LendlePositions() {
  return (
    <WalletProvider>
      <RequireWallet>
        <LendlePositionsList />
      </RequireWallet>
    </WalletProvider>
  );
}
