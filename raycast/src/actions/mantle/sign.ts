import { Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export interface SignResult {
  message: string;
  signature: string;
  address: string;
}

export async function signMessage(privateKey: `0x${string}`, message: string): Promise<SignResult> {
  const account: Account = privateKeyToAccount(privateKey);
  const signature = await account.signMessage({ message });

  return {
    message,
    signature,
    address: account.address,
  };
}
