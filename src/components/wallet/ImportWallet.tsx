import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation } from "@raycast/api";
import { useWallet } from "../../hooks/useWallet";

interface ImportWalletProps {
  onSuccess: () => void;
}

export function ImportWallet({ onSuccess }: ImportWalletProps) {
  const { savePrivateKey } = useWallet();
  const { pop } = useNavigation();
  const [privateKey, setPrivateKey] = useState("");
  const [privateKeyError, setPrivateKeyError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const validatePrivateKey = (pk: string) => {
    if (!pk.trim()) {
      setPrivateKeyError("Private key is required");
      return false;
    }
    if (!pk.startsWith("0x")) {
      setPrivateKeyError("Private key must start with 0x");
      return false;
    }
    if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
      setPrivateKeyError("Private key must be 64 hex characters (32 bytes)");
      return false;
    }
    setPrivateKeyError(undefined);
    return true;
  };

  const handleImportWallet = async () => {
    if (!validatePrivateKey(privateKey)) return;

    try {
      setIsLoading(true);
      await savePrivateKey(privateKey);
      await showToast({ style: Toast.Style.Success, title: "Wallet imported successfully!" });
      onSuccess();
      pop();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to import wallet";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Import Wallet" icon={Icon.Upload} onAction={handleImportWallet} />
          <Action title="Back" icon={Icon.ChevronLeft} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.PasswordField
        id="privateKey"
        title="Private Key"
        placeholder="0x..."
        value={privateKey}
        onChange={setPrivateKey}
        onBlur={() => validatePrivateKey(privateKey)}
        error={privateKeyError}
      />
      <Form.Description text="Enter your private key in hex format (0x followed by 64 hex characters)" />
    </Form>
  );
}
