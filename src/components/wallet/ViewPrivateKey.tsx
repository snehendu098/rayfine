import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon, useNavigation, Clipboard, Detail } from "@raycast/api";
import { useWallet } from "../../hooks/useWallet";

export function ViewPrivateKey() {
  const { privateKey, verifyPassword } = useWallet();
  const { pop } = useNavigation();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleVerifyPassword = async () => {
    setPasswordError(undefined);
    const isValid = verifyPassword(password);
    if (isValid) {
      setIsUnlocked(true);
      await showToast({ style: Toast.Style.Success, title: "Password verified" });
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleCopyPrivateKey = async () => {
    if (privateKey) {
      await Clipboard.copy(privateKey);
      await showToast({ style: Toast.Style.Success, title: "Private key copied to clipboard" });
    }
  };

  if (isUnlocked && privateKey) {
    return (
      <Detail
        markdown={`# Private Key\n\n\`\`\`\n${privateKey}\n\`\`\`\n\n⚠️ **Warning:** Never share your private key with anyone!`}
        actions={
          <ActionPanel>
            <Action title="Copy Private Key" icon={Icon.CopyClipboard} onAction={handleCopyPrivateKey} />
            <Action title="Back" icon={Icon.ChevronLeft} onAction={pop} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Unlock" icon={Icon.LockUnlocked} onAction={handleVerifyPassword} />
          <Action title="Back" icon={Icon.ChevronLeft} onAction={pop} />
        </ActionPanel>
      }
    >
      <Form.Description text="Enter your password to view your private key" />
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="Enter password"
        value={password}
        onChange={setPassword}
        error={passwordError}
      />
    </Form>
  );
}
