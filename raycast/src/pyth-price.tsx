import { useState, useMemo, useEffect, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Detail } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { createAgentKit } from "./utils/agentKit";
import { pythGetPrice } from "./actions/kit/pyth";
import { getTokens, OpenOceanToken } from "./actions/kit/openocean";

function PythPriceForm() {
  const { privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [tokens, setTokens] = useState<OpenOceanToken[]>([]);
  const [selectedToken, setSelectedToken] = useState("");
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agent = useMemo(() => {
    if (!privateKey) return null;
    return createAgentKit(privateKey, "mainnet");
  }, [privateKey]);

  const loadTokens = useCallback(async () => {
    if (!agent) return;
    try {
      setIsLoadingTokens(true);
      const tokenList = await getTokens(agent);
      setTokens(tokenList);
      if (tokenList.length > 0) setSelectedToken(tokenList[0].address);
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load tokens" });
    } finally {
      setIsLoadingTokens(false);
    }
  }, [agent]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const selectedTokenData = tokens.find((t) => t.address === selectedToken);

  const handleGetPrice = async () => {
    if (!agent) {
      await showToast({ style: Toast.Style.Failure, title: "No wallet connected" });
      return;
    }

    if (!selectedToken) {
      await showToast({ style: Toast.Style.Failure, title: "Select a token" });
      return;
    }

    try {
      setIsSubmitting(true);
      await showToast({ style: Toast.Style.Animated, title: "Fetching price..." });

      const result = await pythGetPrice(agent, selectedToken);
      const price = parseFloat(result.price) * Math.pow(10, result.exponent);
      const conf = parseFloat(result.confidence) * Math.pow(10, result.exponent);
      const publishDate = new Date(result.publishTime * 1000).toLocaleString();

      await showToast({ style: Toast.Style.Success, title: "Price fetched!" });

      const formattedPrice = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });

      const tokenLabel = selectedTokenData ? `${selectedTokenData.symbol} (${result.pair})` : result.pair;

      push(
        <Detail
          markdown={`# ${tokenLabel}\n\n## $${formattedPrice}\n\n*± $${conf.toFixed(6)} confidence*`}
          metadata={
            <Detail.Metadata>
              <Detail.Metadata.Label title="Price" text={`$${formattedPrice}`} />
              <Detail.Metadata.Label title="Confidence" text={`± $${conf.toFixed(6)}`} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="Feed ID" text={result.priceFeedId.slice(0, 16) + "..."} />
              <Detail.Metadata.Label title="Published" text={publishDate} />
              <Detail.Metadata.Separator />
              <Detail.Metadata.TagList title="Source">
                <Detail.Metadata.TagList.Item text="Pyth Network" color="#6B4BFF" />
              </Detail.Metadata.TagList>
            </Detail.Metadata>
          }
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Price" content={price.toString()} />
              <Action.CopyToClipboard title="Copy Feed ID" content={result.priceFeedId} />
              <Action.OpenInBrowser title="View on Pyth" url={`https://pyth.network/price-feeds`} />
            </ActionPanel>
          }
        />,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch price";
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
          <Action title="Get Price" icon={Icon.MagnifyingGlass} onAction={handleGetPrice} />
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
    </Form>
  );
}

export default function PythPrice() {
  return (
    <WalletProvider>
      <RequireWallet>
        <PythPriceForm />
      </RequireWallet>
    </WalletProvider>
  );
}
