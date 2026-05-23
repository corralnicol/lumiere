import { Resend } from 'resend';

type CreateResendResult =
  | { error: string; resend?: never; sender?: never }
  | { error?: undefined; resend: Resend; sender: string };

function createResend(): CreateResendResult {
  if (!import.meta.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY is not defined in environment variables" };
  }

  if (!import.meta.env.EMAIL_SENDER) {
    return { error: "EMAIL_SENDER is not defined in environment variables" };
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const sender = import.meta.env.EMAIL_SENDER!;

  return {
    resend,
    sender,
  };
}

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string[];
  subject: string;
  react: React.ReactNode;
}): Promise<string | undefined> {
  const resendConfig = createResend();
  if (resendConfig.error !== undefined) {
    return resendConfig.error;
  }

  const { resend, sender } = resendConfig;

  try {
    const { error } = await resend.emails.send({
      from: sender,
      to: to,
      subject: subject,
      react: react,
    });

    if (error) {
      return error.message ?? "Failed to send email";
    }
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return error instanceof Error ? error.message : "Failed to send email";
  }
}
