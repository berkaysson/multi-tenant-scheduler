import { MAIN_DOMAIN } from "@/routes";
import { Resend } from "resend";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// update links according to your needs
// MAIN_DOMAIN can be set in routes.ts, http://localhost:3000 for example
// update from addresses according to your needs

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${MAIN_DOMAIN}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href='${confirmLink}'>here</a> to confirm email.</p>`,
  });
};

// Send reset password email
export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${MAIN_DOMAIN}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your email",
    html: `<p>Click <a href='${resetLink}'>here</a> to reset password.</p>`,
  });
};
