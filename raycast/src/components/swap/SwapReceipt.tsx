import { Detail, ActionPanel, Action, Icon, open } from "@raycast/api";
import { formatUnits } from "viem";

interface SwapReceiptProps {
  txHash: string;
  explorerUrl: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  outAmount: string;
  outDecimals: number;
}

export function SwapReceiptView({
  txHash,
  explorerUrl,
  fromSymbol,
  toSymbol,
  fromAmount,
  outAmount,
  outDecimals,
}: SwapReceiptProps) {
  // Handle both wei (raw) and already-formatted amounts
  let formattedOut: string;
  try {
    // If it's a valid integer string (wei), format it
    if (/^\d+$/.test(outAmount)) {
      formattedOut = formatUnits(BigInt(outAmount), outDecimals);
    } else {
      // Already formatted or decimal string
      formattedOut = parseFloat(outAmount).toFixed(6);
    }
  } catch {
    formattedOut = outAmount;
  }

  const markdown = `# Swap Complete

## Transaction Hash

\`\`\`
${txHash}
\`\`\`

## Swap Details

| Field | Value |
|-------|-------|
| **From** | ${fromAmount} ${fromSymbol} |
| **To** | ${formattedOut} ${toSymbol} |

**Swap successfully executed on OpenOcean!**
`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="View in Explorer" icon={Icon.Globe} onAction={() => open(explorerUrl)} />
        </ActionPanel>
      }
    />
  );
}
