import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { getTokens, getQuote, getTokenBalance, OpenOceanToken } from "./actions/kit/openocean";
import { executeMerchantMoeSwap } from "./actions/kit/merchantmoe";
import { SwapReceiptView } from "./components/swap/SwapReceipt";
import { Address } from "viem";

const NATIVE_TOKEN: OpenOceanToken = {
  symbol: "MNT",
  name: "Mantle",
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  decimals: 18,
};

function MerchantMoeSwapForm() {
  const { account, publicClient, privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([NATIVE_TOKEN]);
  const [fromToken, setFromToken] = useState(NATIVE_TOKEN.address);
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [balance, setBalance] = useState({ formatted: "0", decimals: 18 });
  const [slippage, setSlippage] = useState("1");
  const [customSlippage, setCustomSlippage] = useState("");

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const [amountError, setAmountError] = useState<string>();
  const [slippageError, setSlippageError] = useState<string>();

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const selectedFromToken = useMemo(
    () => tokens.find((t) => t.address === fromToken) || NATIVE_TOKEN,
    [tokens, fromToken],
  );

  const selectedToToken = useMemo(() => tokens.find((t) => t.address === toToken), [tokens, toToken]);

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
      const tokenAddr = fromToken === NATIVE_TOKEN.address ? "native" : (fromToken as Address);
      const bal = await getTokenBalance(publicClient, tokenAddr, account.address as Address);
      setBalance({ formatted: bal.formatted, decimals: bal.decimals });
    } catch {
      setBalance({ formatted: "0", decimals: 18 });
    }
  }, [publicClient, account, fromToken]);

  const loadQuote = useCallback(async () => {
    if (!agent || !fromToken || !toToken || !fromAmount) {
      setToAmount("");
      return;
    }
    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) {
      setToAmount("");
      return;
    }
    try {
      setIsLoadingQuote(true);
      const quote = await getQuote(agent, fromToken as Address, toToken as Address, fromAmount);
      setToAmount((Number(quote.outAmount) / 10 ** quote.outToken.decimals).toFixed(6));
    } catch {
      setToAmount("");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [agent, fromToken, toToken, fromAmount]);

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

  const getSlippageValue = (): number => {
    if (slippage === "custom") {
      const val = parseFloat(customSlippage);
      return isNaN(val) ? 1 : val;
    }
    return parseFloat(slippage);
  };

  const validateSlippage = () => {
    if (slippage !== "custom") {
      setSlippageError(undefined);
      return true;
    }
    const val = parseFloat(customSlippage);
    if (isNaN(val) || val <= 0 || val > 50) {
      setSlippageError("0-50%");
      return false;
    }
    setSlippageError(undefined);
    return true;
  };

  const handleSwap = async () => {
    if (!validateAmount(fromAmount) || !validateSlippage()) return;
    if (!agent || !account) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }
    if (!toToken) {
      await showToast({ style: Toast.Style.Failure, title: "Select output token" });
      return;
    }

    try {
      setIsSwapping(true);
      await showToast({ style: Toast.Style.Animated, title: "Swapping on Merchant Moe..." });

      const result = await executeMerchantMoeSwap(
        agent,
        fromToken as Address,
        toToken as Address,
        fromAmount,
        getSlippageValue(),
      );

      await showToast({ style: Toast.Style.Success, title: "Swap complete!" });
      push(
        <SwapReceiptView
          txHash={result.txHash}
          explorerUrl={`https://mantlescan.xyz/tx/${result.txHash}`}
          fromSymbol={selectedFromToken.symbol}
          toSymbol={selectedToToken?.symbol || ""}
          fromAmount={fromAmount}
          outAmount={toAmount}
          outDecimals={selectedToToken?.decimals || 18}
        />,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: msg });
    } finally {
      setIsSwapping(false);
    }
  };

  const balanceDescription = `Balance: ${balance.formatted} ${selectedFromToken.symbol}`;

  return (
    <Form
      isLoading={walletLoading || isLoadingTokens || isLoadingQuote || isSwapping}
      actions={
        <ActionPanel>
          <Action title="Swap" icon={Icon.Switch} onAction={handleSwap} />
        </ActionPanel>
      }
    >
      <Form.Description title="Network" text="Mantle (Mainnet)" />

      <Form.Separator />

      <Form.TextField
        id="fromAmount"
        title="From Amount"
        placeholder="0.0"
        value={fromAmount}
        onChange={setFromAmount}
        onBlur={() => validateAmount(fromAmount)}
        error={amountError}
      />

      <Form.Dropdown id="fromToken" title="From Token" value={fromToken} onChange={setFromToken}>
        {tokens.map((token) => (
          <Form.Dropdown.Item key={token.address} value={token.address} title={`${token.symbol} - ${token.name}`} />
        ))}
      </Form.Dropdown>

      <Form.Description text={balanceDescription} />

      <Form.Dropdown id="toToken" title="To Token" value={toToken} onChange={setToToken}>
        <Form.Dropdown.Item value="" title="Select token..." />
        {tokens
          .filter((t) => t.address !== fromToken)
          .map((token) => (
            <Form.Dropdown.Item key={token.address} value={token.address} title={`${token.symbol} - ${token.name}`} />
          ))}
      </Form.Dropdown>

      <Form.Description
        title="Est. Output"
        text={toAmount ? `${toAmount} ${selectedToToken?.symbol || ""}` : "Select tokens and enter amount"}
      />

      <Form.Separator />

      <Form.Dropdown id="slippage" title="Slippage" value={slippage} onChange={setSlippage}>
        <Form.Dropdown.Item value="0.5" title="0.5%" />
        <Form.Dropdown.Item value="1" title="1%" />
        <Form.Dropdown.Item value="5" title="5%" />
        <Form.Dropdown.Item value="custom" title="Custom" />
      </Form.Dropdown>

      {slippage === "custom" && (
        <Form.TextField
          id="customSlippage"
          title="Custom Slippage %"
          placeholder="1.0"
          value={customSlippage}
          onChange={setCustomSlippage}
          onBlur={validateSlippage}
          error={slippageError}
        />
      )}
    </Form>
  );
}

export default function MerchantMoe() {
  return (
    <WalletProvider>
      <RequireWallet>
        <MerchantMoeSwapForm />
      </RequireWallet>
    </WalletProvider>
  );
}
