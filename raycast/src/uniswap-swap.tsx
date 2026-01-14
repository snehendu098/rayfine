import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Detail } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { getTokens, getTokenBalance, OpenOceanToken } from "./actions/kit/openocean";
import { getUniswapQuote, swapOnUniswap } from "./actions/kit/uniswap";
import { Address } from "viem";

const NATIVE_TOKEN: OpenOceanToken = {
  symbol: "MNT",
  name: "Mantle",
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  decimals: 18,
};

function UniswapSwapForm() {
  const { account, publicClient, privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([NATIVE_TOKEN]);
  const [fromToken, setFromToken] = useState(NATIVE_TOKEN.address);
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [balance, setBalance] = useState({ formatted: "0", decimals: 18 });
  const [quote, setQuote] = useState<string | null>(null);

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string>();

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const fromTokenData = useMemo(
    () => tokens.find((t) => t.address === fromToken) || NATIVE_TOKEN,
    [tokens, fromToken],
  );

  const toTokenData = useMemo(() => tokens.find((t) => t.address === toToken), [tokens, toToken]);

  const loadTokens = useCallback(async () => {
    if (!agent) return;
    try {
      setIsLoadingTokens(true);
      const tokenList = await getTokens(agent);
      setTokens([NATIVE_TOKEN, ...tokenList]);
      if (tokenList.length > 0) {
        setToToken(tokenList[0].address);
      }
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load tokens" });
    } finally {
      setIsLoadingTokens(false);
    }
  }, [agent]);

  const loadBalance = useCallback(async () => {
    if (!publicClient || !account) return;
    try {
      const tokenAddr = fromToken === NATIVE_TOKEN.address ? "native" : (fromToken as Address);
      const bal = await getTokenBalance(publicClient, tokenAddr, account.address as Address);
      setBalance({ formatted: bal.formatted, decimals: bal.decimals });
    } catch {
      setBalance({ formatted: "0", decimals: 18 });
    }
  }, [publicClient, account, fromToken]);

  const loadQuote = useCallback(async () => {
    if (!agent || !amount || !toToken || fromToken === toToken) {
      setQuote(null);
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setQuote(null);
      return;
    }
    try {
      setIsLoadingQuote(true);
      const q = await getUniswapQuote(agent, fromToken as Address, toToken as Address, amount);
      setQuote(q.amountOut);
    } catch {
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [agent, amount, fromToken, toToken]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    const timer = setTimeout(loadQuote, 500);
    return () => clearTimeout(timer);
  }, [loadQuote]);

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

  const handleSwap = async () => {
    if (!validateAmount(amount)) return;
    if (!agent || !account) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }
    if (fromToken === toToken) {
      await showToast({ style: Toast.Style.Failure, title: "Select different tokens" });
      return;
    }

    try {
      setIsSubmitting(true);
      await showToast({ style: Toast.Style.Animated, title: "Swapping on Uniswap V3..." });

      const slip = parseFloat(slippage) || 0.5;
      const result = await swapOnUniswap(agent, fromToken as Address, toToken as Address, amount, slip);

      await showToast({ style: Toast.Style.Success, title: "Swap complete!" });
      push(
        <Detail
          markdown={`# Swap Successful\n\n**From:** ${amount} ${fromTokenData.symbol}\n**To:** ${quote || "?"} ${toTokenData?.symbol || ""}\n\n**Transaction:** [${result.txHash.slice(0, 10)}...](https://mantlescan.xyz/tx/${result.txHash})`}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="View on Explorer" url={`https://mantlescan.xyz/tx/${result.txHash}`} />
            </ActionPanel>
          }
        />,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={walletLoading || isLoadingTokens || isSubmitting || isLoadingQuote}
      actions={
        <ActionPanel>
          <Action title="Swap" icon={Icon.Switch} onAction={handleSwap} />
        </ActionPanel>
      }
    >
      <Form.Description title="Network" text="Mantle (Mainnet)" />
      <Form.Separator />

      <Form.Dropdown id="fromToken" title="From Token" value={fromToken} onChange={setFromToken}>
        {tokens.map((t) => (
          <Form.Dropdown.Item key={t.address} value={t.address} title={`${t.symbol} - ${t.name}`} />
        ))}
      </Form.Dropdown>

      <Form.Description text={`Balance: ${balance.formatted} ${fromTokenData.symbol}`} />

      <Form.TextField
        id="amount"
        title="Amount"
        placeholder="0.0"
        value={amount}
        onChange={setAmount}
        onBlur={() => validateAmount(amount)}
        error={amountError}
      />

      <Form.Separator />

      <Form.Dropdown id="toToken" title="To Token" value={toToken} onChange={setToToken}>
        {tokens
          .filter((t) => t.address !== fromToken)
          .map((t) => (
            <Form.Dropdown.Item key={t.address} value={t.address} title={`${t.symbol} - ${t.name}`} />
          ))}
      </Form.Dropdown>

      {quote && <Form.Description text={`Quote: ~${quote} ${toTokenData?.symbol || ""}`} />}

      <Form.TextField
        id="slippage"
        title="Slippage %"
        placeholder="0.5"
        value={slippage}
        onChange={setSlippage}
      />
    </Form>
  );
}

export default function UniswapSwap() {
  return (
    <WalletProvider>
      <RequireWallet>
        <UniswapSwapForm />
      </RequireWallet>
    </WalletProvider>
  );
}
