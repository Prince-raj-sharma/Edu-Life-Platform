import { Router } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import { signToken } from "../lib/jwt";
import { sendOtpEmail, sendPasswordResetEmail } from "../lib/email";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar ?? null,
    purchasedCourses: user.purchasedCourses.map((id) => id.toString()),
    purchasedPdfs: user.purchasedPdfs.map((id) => id.toString()),
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const user = await User.create({ name, email, password, otp, otpExpiry });

  try {
    await sendOtpEmail(email, otp, name);
  } catch (err) {
    req.log.warn({ err }, "Failed to send OTP email");
  }

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.status(201).json({ token, user: formatUser(user), message: "OTP sent to your email" });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

// POST /api/auth/logout
router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  if (user.isVerified) {
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    res.json({ token, user: formatUser(user), message: "Already verified" });
    return;
  }

  if (!user.otp || !user.otpExpiry || user.otp !== otp) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  if (user.otpExpiry < new Date()) {
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.json({ token, user: formatUser(user), message: "Email verified successfully" });
});

// POST /api/auth/resend-otp
router.post("/auth/resend-otp", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendOtpEmail(email, otp, user.name);
  } catch (err) {
    req.log.warn({ err }, "Failed to send OTP email");
  }

  res.json({ message: "OTP sent to your email" });
});

// POST /api/auth/forgot-password
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if user exists
    res.json({ message: "If that email exists, a reset link has been sent." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(email, token, user.name);
  } catch (err) {
    req.log.warn({ err }, "Failed to send password reset email");
  }

  res.json({ message: "If that email exists, a reset link has been sent." });
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: "Token and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  if (!user) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
});

// GET /api/auth/me
router.get("/auth/me", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
