import { useCallback, useEffect, useState, useMemo } from "react";
import { Network } from "../types";
import { LocalStorage } from "@raycast/api";
import { Account } from "viem";
import { Address, privateKeyToAccount } from "viem/accounts";
import { mantle, mantleSepoliaTestnet } from "viem/chains";
import { createPublicClient, http } from "viem";

import { createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const useWallet = () => {
  const [privateKey, setPrivateKey] = useState<Address | undefined>();
  const [network, setNetwork] = useState<Network>(mantleSepoliaTestnet);
  const [account, setAccount] = useState<Account | undefined>();
  const [passwordHash, setPasswordHash] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const loadWalletAndNetwork = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const storedPk = await LocalStorage.getItem<string>("privateKey");
      const storedNetwork = await LocalStorage.getItem<string>("network");
      const storedPasswordHash = await LocalStorage.getItem<string>("passwordHash");

      if (storedNetwork === "mainnet") {
        setNetwork(mantle);
      } else {
        setNetwork(mantleSepoliaTestnet);
      }

      if (storedPasswordHash) {
        setPasswordHash(storedPasswordHash);
      }

      if (storedPk) {
        setPrivateKey(storedPk as Address);
        const acc = privateKeyToAccount(storedPk as `0x${string}`);
        setAccount(acc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePrivateKey = useCallback(async (pk: string) => {
    try {
      setError(undefined);
      await LocalStorage.setItem("privateKey", pk);
      setPrivateKey(pk as Address);
      const acc = privateKeyToAccount(pk as `0x${string}`);
      setAccount(acc);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save private key";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const savePasswordHash = useCallback(async (hash: string) => {
    try {
      setError(undefined);
      await LocalStorage.setItem("passwordHash", hash);
      setPasswordHash(hash);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save password";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const verifyPassword = useCallback(
    (password: string): boolean => {
      const inputHash = hashPassword(password);
      return inputHash === passwordHash;
    },
    [passwordHash],
  );

  const saveNetwork = useCallback(async (selectedNetwork: Network) => {
    try {
      setError(undefined);
      const networkKey = selectedNetwork === mantle ? "mainnet" : "testnet";
      await LocalStorage.setItem("network", networkKey);
      setNetwork(selectedNetwork);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save network";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const clearWallet = useCallback(async () => {
    try {
      setError(undefined);
      await LocalStorage.removeItem("privateKey");
      await LocalStorage.removeItem("passwordHash");
      setPrivateKey(undefined);
      setPasswordHash(undefined);
      setAccount(undefined);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to clear wallet";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const isWalletConnected = () => !!account && !!privateKey;

  const getAddress = () => account?.address;

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: network,
        transport: http(),
      }),
    [network],
  );

  useEffect(() => {
    loadWalletAndNetwork();
  }, [loadWalletAndNetwork]);

  return {
    privateKey,
    network,
    account,
    passwordHash,
    isLoading,
    error,
    publicClient,
    loadWalletAndNetwork,
    savePrivateKey,
    savePasswordHash,
    verifyPassword,
    saveNetwork,
    clearWallet,
    isWalletConnected,
    getAddress,
  };
};
