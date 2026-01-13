import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Detail } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { getTokens, OpenOceanToken } from "./actions/kit/openocean";
import { lendleWithdraw } from "./actions/kit/lendle";
import { Address, isAddress } from "viem";

const NATIVE_TOKEN: OpenOceanToken = {
  symbol: "MNT",
  name: "Mantle",
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  decimals: 18,
};

function LendleWithdrawForm() {
  const { account, privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([NATIVE_TOKEN]);
  const [selectedToken, setSelectedToken] = useState(NATIVE_TOKEN.address);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string>();
  const [recipientError, setRecipientError] = useState<string>();

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

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

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
    setAmountError(undefined);
    return true;
  };

  const validateRecipient = (addr: string) => {
    if (!addr.trim()) {
      setRecipientError(undefined);
      return true;
    }
    if (!isAddress(addr)) {
      setRecipientError("Invalid address");
      return false;
    }
    setRecipientError(undefined);
    return true;
  };

  const handleWithdraw = async () => {
    if (!validateAmount(amount) || !validateRecipient(recipient)) return;
    if (!agent || !account) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }

    try {
      setIsSubmitting(true);
      await showToast({ style: Toast.Style.Animated, title: "Withdrawing from Lendle..." });

      const to = recipient.trim() ? (recipient as Address) : undefined;
      const result = await lendleWithdraw(agent, selectedToken as Address, amount, to);

      await showToast({ style: Toast.Style.Success, title: "Withdraw complete!" });
      push(
        <Detail
          markdown={`# Withdraw Successful\n\n**Amount:** ${amount} ${token.symbol}\n\n**To:** ${to || account.address}\n\n**Transaction:** [${result.txHash.slice(0, 10)}...](https://mantlescan.xyz/tx/${result.txHash})`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="View on Explorer" url={`https://mantlescan.xyz/tx/${result.txHash}`} />
            </ActionPanel>
          }
        />,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Withdraw failed";
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
          <Action title="Withdraw" icon={Icon.Minus} onAction={handleWithdraw} />
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

      <Form.TextField
        id="amount"
        title="Amount"
        placeholder="0.0"
        value={amount}
        onChange={setAmount}
        onBlur={() => validateAmount(amount)}
        error={amountError}
      />

      <Form.TextField
        id="recipient"
        title="Recipient (Optional)"
        placeholder="0x... (defaults to your wallet)"
        value={recipient}
        onChange={setRecipient}
        onBlur={() => validateRecipient(recipient)}
        error={recipientError}
      />
    </Form>
  );
}

export default function LendleWithdraw() {
  return (
    <WalletProvider>
      <RequireWallet>
        <LendleWithdrawForm />
      </RequireWallet>
    </WalletProvider>
  );
}
