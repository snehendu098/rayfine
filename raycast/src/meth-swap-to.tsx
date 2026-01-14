import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Detail } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { swapToMeth, methGetPosition } from "./actions/kit/meth";
import { formatUnits, parseUnits } from "viem";

function MethSwapToForm() {
  const { account, privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [wethBalance, setWethBalance] = useState("0");

  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState<string>();

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const loadBalance = useCallback(async () => {
    if (!agent || !account) return;
    try {
      setIsLoadingBalance(true);
      const pos = await methGetPosition(agent);
      setWethBalance(formatUnits(pos.wethBalance, 18));
    } catch {
      setWethBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [agent, account]);

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
    const bal = parseFloat(wethBalance);
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

    try {
      setIsSubmitting(true);
      await showToast({ style: Toast.Style.Animated, title: "Swapping WETH to mETH..." });

      const amountWei = parseUnits(amount, 18).toString();
      const slip = parseFloat(slippage) || 0.5;
      const result = await swapToMeth(agent, amountWei, slip);

      await showToast({ style: Toast.Style.Success, title: "Swap complete!" });
      push(
        <Detail
          markdown={`# Swap Successful\n\n**Amount:** ${amount} WETH → mETH\n\n**Slippage:** ${slip}%\n\n**Transaction:** [${result.txHash.slice(0, 10)}...](https://mantlescan.xyz/tx/${result.txHash})`}
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
      isLoading={walletLoading || isLoadingBalance || isSubmitting}
      actions={
        <ActionPanel>
          <Action title="Swap to mETH" icon={Icon.Switch} onAction={handleSwap} />
        </ActionPanel>
      }
    >
      <Form.Description title="Network" text="Mantle (Mainnet)" />
      <Form.Description title="Direction" text="WETH → mETH" />
      <Form.Separator />

      <Form.Description text={`WETH Balance: ${parseFloat(wethBalance).toFixed(6)}`} />

      <Form.TextField
        id="amount"
        title="Amount (WETH)"
        placeholder="0.0"
        value={amount}
        onChange={setAmount}
        onBlur={() => validateAmount(amount)}
        error={amountError}
      />

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

export default function MethSwapTo() {
  return (
    <WalletProvider>
      <RequireWallet>
        <MethSwapToForm />
      </RequireWallet>
    </WalletProvider>
  );
}
