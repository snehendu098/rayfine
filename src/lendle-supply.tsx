import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Detail } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { getTokens, getTokenBalance, OpenOceanToken } from "./actions/kit/openocean";
import { lendleSupply } from "./actions/kit/lendle";
import { Address } from "viem";

const NATIVE_TOKEN: OpenOceanToken = {
  symbol: "MNT",
  name: "Mantle",
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  decimals: 18,
};

function LendleSupplyForm() {
  const { account, publicClient, privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([NATIVE_TOKEN]);
  const [selectedToken, setSelectedToken] = useState(NATIVE_TOKEN.address);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState({ formatted: "0", decimals: 18 });

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string>();

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const token = useMemo(
    () => tokens.find((t) => t.address === selectedToken) || NATIVE_TOKEN,
    [tokens, selectedToken],
  );

  const loadTokens = useCallback(async () => {
    if (!agent) return;
    try {
      setIsLoadingTokens(true);
      const tokenList = await getTokens(agent);
      setTokens([NATIVE_TOKEN, ...tokenList]);
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load tokens" });
    } finally {
      setIsLoadingTokens(false);
    }
  }, [agent]);

  const loadBalance = useCallback(async () => {
    if (!publicClient || !account) return;
    try {
      const tokenAddr = selectedToken === NATIVE_TOKEN.address ? "native" : (selectedToken as Address);
      const bal = await getTokenBalance(publicClient, tokenAddr, account.address as Address);
      setBalance({ formatted: bal.formatted, decimals: bal.decimals });
    } catch {
      setBalance({ formatted: "0", decimals: 18 });
    }
  }, [publicClient, account, selectedToken]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const validateAmount = (val: string) => {
    if (!val.trim()) {
      setAmountError("Amount required");
      return false;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setAmountError("Must be positive");
      return false;
    }
    const bal = parseFloat(balance.formatted);
    if (num > bal) {
      setAmountError("Exceeds balance");
      return false;
    }
    setAmountError(undefined);
    return true;
  };

  const handleSupply = async () => {
    if (!validateAmount(amount)) return;
    if (!agent || !account) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }

    try {
      setIsSubmitting(true);
      await showToast({ style: Toast.Style.Animated, title: "Supplying to Lendle..." });

      const result = await lendleSupply(agent, selectedToken as Address, amount);

      await showToast({ style: Toast.Style.Success, title: "Supply complete!" });
      push(
        <Detail
          markdown={`# Supply Successful\n\n**Amount:** ${amount} ${token.symbol}\n\n**Transaction:** [${result.txHash.slice(0, 10)}...](https://mantlescan.xyz/tx/${result.txHash})`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="View on Explorer" url={`https://mantlescan.xyz/tx/${result.txHash}`} />
            </ActionPanel>
          }
        />,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Supply failed";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={walletLoading || isLoadingTokens || isSubmitting}
      actions={
        <ActionPanel>
          <Action title="Supply" icon={Icon.Plus} onAction={handleSupply} />
        </ActionPanel>
      }
    >
      <Form.Description title="Network" text="Mantle (Mainnet)" />
      <Form.Separator />

      <Form.Dropdown id="token" title="Token" value={selectedToken} onChange={setSelectedToken}>
        {tokens.map((t) => (
          <Form.Dropdown.Item key={t.address} value={t.address} title={`${t.symbol} - ${t.name}`} />
        ))}
      </Form.Dropdown>

      <Form.Description text={`Balance: ${balance.formatted} ${token.symbol}`} />

      <Form.TextField
        id="amount"
        title="Amount"
        placeholder="0.0"
        value={amount}
        onChange={setAmount}
        onBlur={() => validateAmount(amount)}
        error={amountError}
      />
    </Form>
  );
}

export default function LendleSupply() {
  return (
    <WalletProvider>
      <RequireWallet>
        <LendleSupplyForm />
      </RequireWallet>
    </WalletProvider>
  );
}
