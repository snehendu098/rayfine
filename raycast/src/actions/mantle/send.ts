import {
  Account,
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  isAddress,
  encodeFunctionData,
  erc20Abi,
  TransactionReceipt,
} from "viem";
import { Network } from "../../types";

interface SendAmountOptions {
  tokenAddress?: string;
}

interface SendResult {
  txHash: string;
  explorerUrl: string;
  recipt: TransactionReceipt;
}

export const sendAmount = async (
  to: string,
  amount: string,
  account: Account,
  network: Network,
  options?: SendAmountOptions,
): Promise<SendResult> => {
  try {
    if (!isAddress(to)) {
      throw new Error("Invalid recipient address");
    }

    const walletClient = createWalletClient({
      account,
      chain: network,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: network,
      transport: http(),
    });

    let transactionHash: string;

    if (!options?.tokenAddress) {
      const amountInWei = parseEther(amount);

      transactionHash = await walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: amountInWei,
      });
    } else {
      if (!isAddress(options.tokenAddress)) {
        throw new Error("Invalid token address");
      }

      const decimals = (await publicClient.readContract({
        address: options.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      })) as number;

      const amountInTokenUnits = BigInt(amount) * BigInt(10) ** BigInt(decimals);

      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as `0x${string}`, amountInTokenUnits],
      });

      transactionHash = await walletClient.sendTransaction({
        to: options.tokenAddress as `0x${string}`,
        data,
      });
    }

    const recipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash as `0x${string}` });

    const explorerBaseUrl = network.id === 5000 ? "https://mantlescan.xyz" : "https://sepolia.mantlescan.xyz";
    const explorerUrl = `${explorerBaseUrl}/tx/${transactionHash}`;

    return {
      txHash: recipt.transactionHash,
      explorerUrl,
      recipt,
    };
  } catch (err: any) {
    console.log(err);
    throw new Error(err.message || "Failed to send transaction");
  }
};
