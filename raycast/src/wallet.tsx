import { useState, useEffect } from "react";
import { List, Icon, ActionPanel, Action, useNavigation } from "@raycast/api";
import { useWallet } from "./hooks/useWallet";
import { GenerateWallet, ImportWallet, WalletConnected } from "./components/wallet";

export default function WalletCommand() {
  const { isWalletConnected, isLoading } = useWallet();
  const [connected, setConnected] = useState(isWalletConnected());
  const { push } = useNavigation();

  useEffect(() => {
    setConnected(isWalletConnected());
  }, [isLoading]);

  if (connected) {
    return <WalletConnected onDisconnected={() => setConnected(false)} />;
  }

  return (
    <List>
      <List.EmptyView
        icon={Icon.Lock}
        title="No Wallet Connected"
        description="Set up your wallet to start interacting with Mantle"
        actions={
          <ActionPanel>
            <Action
              title="Generate New Wallet"
              icon={Icon.Wand}
              onAction={() => {
                push(<GenerateWallet onSuccess={() => setConnected(true)} />);
              }}
            />
            <Action
              title="Import Wallet"
              icon={Icon.Upload}
              onAction={() => {
                push(<ImportWallet onSuccess={() => setConnected(true)} />);
              }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
