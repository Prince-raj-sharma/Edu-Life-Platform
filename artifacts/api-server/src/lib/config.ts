/**
 * Centralized, validated configuration.
 *
 * All environment variables are read and validated here, once, at startup.
 * Every other module imports from this file instead of reading process.env directly.
 *
 * In production (Replit), secrets are injected into process.env before the process
 * starts — no dotenv needed. For local development, set them in your shell or a
 * .env file loaded by your dev runner.
 */

function require(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `  → In Replit: add it under Tools → Secrets\n` +
        `  → Locally: export ${name}=<value> before starting the server`,
    );
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const config = {
  // ── Server ─────────────────────────────────────────────────────────────────
  port: Number(optional("PORT", "8080")),
  nodeEnv: optional("NODE_ENV", "development"),

  // ── MongoDB ─────────────────────────────────────────────────────────────────
  mongodbUri: require("MONGODB_URI"),

  // ── JWT ─────────────────────────────────────────────────────────────────────
  jwtSecret: require("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),

  // ── Cloudinary ───────────────────────────────────────────────────────────────
  cloudinary: {
    cloudName: require("CLOUDINARY_CLOUD_NAME"),
    apiKey: require("CLOUDINARY_API_KEY"),
    apiSecret: require("CLOUDINARY_API_SECRET"),
  },

  // ── Razorpay ─────────────────────────────────────────────────────────────────
  razorpay: {
    keyId: require("RAZORPAY_KEY_ID"),
    keySecret: require("RAZORPAY_KEY_SECRET"),
  },

  // ── Admin seed ───────────────────────────────────────────────────────────────
  adminEmail: require("ADMIN_EMAIL"),
  adminPassword: require("ADMIN_PASSWORD"),

  // ── Email (optional — not required for core functionality) ───────────────────
  smtp: {
    user: optional("SMTP_USER", ""),
    pass: optional("SMTP_PASS", ""),
    from: optional("EMAIL_FROM", ""),
  },
} as const;
