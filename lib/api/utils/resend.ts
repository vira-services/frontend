import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `https://vira.wtf/verification?token=${token}`;
  await resend.emails.send({
    from: "noreply@vira.wtf",
    to: email,
    subject: "Verify your email address - Vira",
    html: `
      <div>
        <h1>Welcome to Vira!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${confirmLink}">Verify Email</a>
        <p>Or copy and paste this link into your browser: ${confirmLink}</p>
      </div>
    `,
  });
}
export async function sendResetEmail(email: string, token: string) {
  const resetLink = `https://vira.wtf/auth/reset-password?token=${token}`;
  await resend.emails.send({
    from: "noreply@vira.wtf",
    to: email,
    subject: "Reset your password - Vira",
    html: `
    <div>
         <h1>Reset Your Password</h1>
         <p>You requested a password reset. Click the link below to choose a new password:</p>
         <a href="${resetLink}">Reset Password</a>
         <p>Or copy and paste this link into your browser: ${resetLink}</p>
         <p>If you didn't request this, you can safely ignore this email.</p>
       </div>
    `,
  });
}
