import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation } from "@raycast/api";
import { generatePrivateKey } from "viem/accounts";
import { useWallet, hashPassword } from "../../hooks/useWallet";

interface GenerateWalletProps {
  onSuccess: () => void;
}

export function GenerateWallet({ onSuccess }: GenerateWalletProps) {
  const { savePrivateKey, savePasswordHash } = useWallet();
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleGenerateWallet = async () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError(undefined);

    try {
      setIsLoading(true);
      const privateKey = generatePrivateKey();
      const hash = hashPassword(password);
      await savePrivateKey(privateKey);
      await savePasswordHash(hash);
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

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action title="Generate Wallet" icon={Icon.Wand} onAction={handleGenerateWallet} />
          <Action title="Back" icon={Icon.ChevronLeft} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.Description text="Set a password to protect your private key" />
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="Enter password"
        value={password}
        onChange={setPassword}
      />
      <Form.PasswordField
        id="confirmPassword"
        title="Confirm Password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={passwordError}
      />
    </Form>
  );
}
