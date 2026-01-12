import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation } from "@raycast/api";
import { useWallet } from "./hooks/useWallet";
import { sendAmount } from "./actions/mantle/send";
import { TransactionReceiptView } from "./components/send/TransactionReceipt";
import { createAgentKit } from "./utils/agentKit";
import { getTokens, OpenOceanToken } from "./actions/kit/openocean";
import { isAddress } from "viem";
import { mantle, mantleSepoliaTestnet } from "viem/chains";

export default function Send() {
  const { account, network, saveNetwork, privateKey, isLoading: walletLoading } = useWallet();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("native");
  const [customTokenAddress, setCustomTokenAddress] = useState("");

  const [recipientError, setRecipientError] = useState<string>();
  const [amountError, setAmountError] = useState<string>();
  const [customTokenError, setCustomTokenError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const networkValue = network.id === 5000 ? "mainnet" : "testnet";

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, networkValue);
  }, [privateKey, networkValue]);

  const loadTokens = useCallback(async () => {
    if (!agent) return;
    try {
      setIsLoadingTokens(true);
      const tokenList = await getTokens(agent);
      setTokens(tokenList);
    } catch {
      // keep empty tokens on error
    } finally {
      setIsLoadingTokens(false);
    }
  }, [agent]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const validateRecipient = (addr: string) => {
    if (!addr.trim()) {
      setRecipientError("Recipient address required");
      return false;
    }
    if (!isAddress(addr)) {
      setRecipientError("Invalid address");
      return false;
    }
    setRecipientError(undefined);
    return true;
  };

  const validateAmount = (val: string) => {
    if (!val.trim()) {
      setAmountError("Amount required");
      return false;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setAmountError("Must be positive number");
      return false;
    }
    setAmountError(undefined);
    return true;
  };

  const validateCustomToken = (addr: string) => {
    if (selectedToken !== "custom") return true;
    if (!addr.trim()) {
      setCustomTokenError("Token address required");
      return false;
    }
    if (!isAddress(addr)) {
      setCustomTokenError("Invalid token address");
      return false;
    }
    setCustomTokenError(undefined);
    return true;
  };

  const handleNetworkChange = async (value: string) => {
    const newNetwork = value === "mainnet" ? mantle : mantleSepoliaTestnet;
    await saveNetwork(newNetwork);
  };

  const getTokenAddress = (): string | undefined => {
    if (selectedToken === "native") return undefined;
    if (selectedToken === "custom") return customTokenAddress;
    const token = tokens.find((t) => t.address === selectedToken);
    return token?.address;
  };

  const handleSend = async () => {
    const validRecipient = validateRecipient(recipient);
    const validAmount = validateAmount(amount);
    const validCustomToken = validateCustomToken(customTokenAddress);

    if (!validRecipient || !validAmount || !validCustomToken) return;

    if (!account) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }

    try {
      setIsLoading(true);
      await showToast({ style: Toast.Style.Animated, title: "Sending transaction..." });

      const tokenAddress = getTokenAddress();
      const result = await sendAmount(recipient, amount, account, network, tokenAddress ? { tokenAddress } : undefined);

      await showToast({ style: Toast.Style.Success, title: "Transaction sent!" });
      push(<TransactionReceiptView receipt={result.recipt} explorerUrl={result.explorerUrl} />);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      isLoading={walletLoading || isLoading || isLoadingTokens}
      actions={
        <ActionPanel>
          <Action title="Send" icon={Icon.Airplane} onAction={handleSend} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="network" title="Network" value={networkValue} onChange={handleNetworkChange}>
        <Form.Dropdown.Item value="testnet" title="Mantle Sepolia (Testnet)" />
        <Form.Dropdown.Item value="mainnet" title="Mantle (Mainnet)" />
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField
        id="recipient"
        title="Recipient"
        placeholder="0x..."
        value={recipient}
        onChange={setRecipient}
        onBlur={() => validateRecipient(recipient)}
        error={recipientError}
      />

      <Form.TextField
        id="amount"
        title="Amount"
        placeholder="0.0"
        value={amount}
        onChange={setAmount}
        onBlur={() => validateAmount(amount)}
        error={amountError}
      />

      <Form.Dropdown id="token" title="Token" value={selectedToken} onChange={setSelectedToken}>
        <Form.Dropdown.Item value="native" title="MNT (Native)" />
        <Form.Dropdown.Section title="Tokens">
          {tokens.map((token) => (
            <Form.Dropdown.Item key={token.address} value={token.address} title={`${token.symbol} - ${token.name}`} />
          ))}
        </Form.Dropdown.Section>
        <Form.Dropdown.Item value="custom" title="Custom Token" />
      </Form.Dropdown>

      {selectedToken === "custom" && (
        <Form.TextField
          id="customToken"
          title="Token Address"
          placeholder="0x..."
          value={customTokenAddress}
          onChange={setCustomTokenAddress}
          onBlur={() => validateCustomToken(customTokenAddress)}
          error={customTokenError}
        />
      )}
    </Form>
  );
}
