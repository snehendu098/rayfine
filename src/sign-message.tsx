import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Detail, useNavigation } from "@raycast/api";
import { WalletProvider, useWalletContext, RequireWallet } from "./context/WalletContext";
import { signMessage, SignResult } from "./actions/mantle/sign";

function SignMessageForm() {
  const { privateKey, isLoading: walletLoading } = useWalletContext();
  const { push } = useNavigation();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!privateKey || !message.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Enter a message" });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signMessage(privateKey, message);
      push(<SignatureResult result={result} />);
    } catch (err) {
      await showToast({ style: Toast.Style.Failure, title: "Signing failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isLoading={walletLoading || isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Sign Message" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="message" title="Message" placeholder="Enter message to sign" value={message} onChange={setMessage} />
    </Form>
  );
}

function SignatureResult({ result }: { result: SignResult }) {
  const markdown = `# Signature

**Message:**
\`\`\`
${result.message}
\`\`\`

**Signature:**
\`\`\`
${result.signature}
\`\`\`

**Signed by:** \`${result.address}\``;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Signature" content={result.signature} />
          <Action.CopyToClipboard title="Copy Message" content={result.message} />
        </ActionPanel>
      }
    />
  );
}

export default function SignMessage() {
  return (
    <WalletProvider>
      <RequireWallet>
        <SignMessageForm />
      </RequireWallet>
    </WalletProvider>
  );
}
