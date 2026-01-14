import { useState, useEffect } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, Clipboard, useNavigation } from "@raycast/api";
import { formatEther } from "viem";
import { useWallet } from "../../hooks/useWallet";
import { ViewPrivateKey } from "./ViewPrivateKey";

interface WalletConnectedProps {
  onDisconnected: () => void;
}

export function WalletConnected({ onDisconnected }: WalletConnectedProps) {
  const { getAddress, clearWallet, network, publicClient } = useWallet();
  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string>("0");
  const [error, setError] = useState<string>();

  const address = getAddress();
  const networkName = network?.name || "Unknown";
  const networkType = network?.id === 5000 ? "Mainnet" : "Testnet";

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        setError(undefined);

        const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
        const balanceEth = formatEther(balanceWei);
        setBalance(balanceEth);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch balance";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, publicClient]);

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await clearWallet();
      await showToast({ style: Toast.Style.Success, title: "Wallet disconnected" });
      onDisconnected();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    await Clipboard.copy(address);
    await showToast({ style: Toast.Style.Success, title: "Address copied to clipboard" });
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Copy Address" icon={Icon.CopyClipboard} onAction={handleCopyAddress} />
          <Action title="View Private Key" icon={Icon.Key} onAction={() => push(<ViewPrivateKey />)} />
          <Action
            title="Disconnect Wallet"
            icon={Icon.XMarkCircle}
            style={Action.Style.Destructive}
            onAction={handleDisconnect}
          />
        </ActionPanel>
      }
    >
      <Form.Description text={`Address:\n${address}`} />
      <Form.Description text={`Network: ${networkName} (${networkType})`} />
      <Form.Description text={`Balance: ${isLoading ? "Loading" : `${balance} MNT`}`} />
      {error && <Form.Description text={`Error: ${error}`} />}
    </Form>
  );
}
