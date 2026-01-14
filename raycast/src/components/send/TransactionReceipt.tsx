import { Detail, ActionPanel, Action, Icon, open } from "@raycast/api";
import { TransactionReceipt } from "viem";
import { formatEther } from "viem";

interface TransactionReceiptProps {
  receipt: TransactionReceipt;
  explorerUrl: string;
}

export function TransactionReceiptView({ receipt, explorerUrl }: TransactionReceiptProps) {
  const formatStatus = (success: boolean) => (success ? "Success" : "Failed");

  const markdown = `# Transaction Confirmed

## Full Transaction Hash

\`\`\`
${receipt.transactionHash}
\`\`\`

## Transaction Details

| Field | Value |
|-------|-------|
| **Status** | ${formatStatus(receipt.status === "success")} |
| **Hash** | \`${receipt.transactionHash}\` |
| **Block** | ${receipt.blockNumber} |
| **From** | \`${receipt.from}\` |
| **To** | ${receipt.to ? `\`${receipt.to}\`` : "Contract Creation"} |
| **Gas Used** | ${receipt.gasUsed.toString()} |
| **Gas Price** | ${formatEther(receipt.effectiveGasPrice)} MNT |
| **Tx Fee** | ${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} MNT |
| **Type** | ${receipt.type} |
| **Logs** | ${receipt.logs.length} |

**Transaction successfully confirmed on the Mantle blockchain!**
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
