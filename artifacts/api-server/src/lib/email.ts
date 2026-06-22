import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: `"LIFE WITH AI" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Verify your email - LIFE WITH AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">LIFE WITH AI</h2>
        <p>Hi ${name},</p>
        <p>Your email verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #1e3a5f; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">LIFE WITH AI - Learn AI Skills for the Future</p>
      </div>
    `,
  });
  logger.info({ to }, "OTP email sent");
}

export async function sendPasswordResetEmail(to: string, token: string, name: string): Promise<void> {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5173";
  const resetUrl = `https://${domain}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"LIFE WITH AI" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Reset your password - LIFE WITH AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">LIFE WITH AI</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #1e3a5f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">Reset Password</a>
        </div>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">LIFE WITH AI - Learn AI Skills for the Future</p>
      </div>
    `,
  });
  logger.info({ to }, "Password reset email sent");
}
