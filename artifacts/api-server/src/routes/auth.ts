import { Router } from "express";
import { User } from "../models/User";
import { signToken } from "../lib/jwt";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

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

  // Create user as immediately verified — no OTP required
  const user = await User.create({
    name,
    email,
    password,
    isVerified: true,
    role: "student",
  });

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  res.status(201).json({ token, user: formatUser(user) });
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

// GET /api/auth/me
router.get("/auth/me", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

// POST /api/auth/forgot-password — disabled (SMTP not configured)
router.post("/auth/forgot-password", async (_req, res): Promise<void> => {
  res.status(503).json({ error: "Password reset is currently unavailable. Please contact support." });
});

// POST /api/auth/reset-password — disabled
router.post("/auth/reset-password", async (_req, res): Promise<void> => {
  res.status(503).json({ error: "Password reset is currently unavailable. Please contact support." });
});

export default router;
