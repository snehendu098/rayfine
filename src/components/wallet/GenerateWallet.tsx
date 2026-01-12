import { useState, useEffect } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation } from "@raycast/api";
import { generatePrivateKey } from "viem/accounts";
import { useWallet } from "../../hooks/useWallet";

interface GenerateWalletProps {
  onSuccess: () => void;
}

export function GenerateWallet({ onSuccess }: GenerateWalletProps) {
  const { savePrivateKey } = useWallet();
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateWallet = async () => {
    try {
      setIsLoading(true);
      const privateKey = generatePrivateKey();
      await savePrivateKey(privateKey);
      await showToast({ style: Toast.Style.Success, title: "Wallet created successfully!" });
      onSuccess();
      pop();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create wallet";
      await showToast({ style: Toast.Style.Failure, title: "Error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateWallet();
  }, []);

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Back" icon={Icon.ChevronLeft} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.Description text="Generating new wallet..." />
    </Form>
  );
}
