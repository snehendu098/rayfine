import { createContext, useContext, ReactNode } from "react";
import { useWallet } from "../hooks/useWallet";
import { Account } from "viem";
import { Network } from "../types";
import { PublicClient } from "viem";
import { Address } from "viem/accounts";
import { Detail, ActionPanel, Action, Icon } from "@raycast/api";

interface WalletContextType {
  privateKey: Address | undefined;
  network: Network;
  account: Account | undefined;
  passwordHash: string | undefined;
  isLoading: boolean;
  error: string | undefined;
  publicClient: PublicClient;
  savePrivateKey: (pk: string) => Promise<void>;
  savePasswordHash: (hash: string) => Promise<void>;
  verifyPassword: (password: string) => boolean;
  saveNetwork: (network: Network) => Promise<void>;
  clearWallet: () => Promise<void>;
  isWalletConnected: () => boolean;
  getAddress: () => string | undefined;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}

export function NoWalletView() {
  return (
    <Detail
      markdown="# No Wallet Connected\n\nCreate or import a wallet first using the **Wallet** command."
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open Wallet Command" icon={Icon.Wallet} url="raycast://extensions/RoyDevelops/rayfine/wallet" />
        </ActionPanel>
      }
    />
  );
}

export function RequireWallet({ children }: { children: ReactNode }) {
  const { isWalletConnected, isLoading } = useWalletContext();

  if (isLoading) {
    return <Detail isLoading />;
  }

  if (!isWalletConnected()) {
    return <NoWalletView />;
  }

  return <>{children}</>;
}
