import { User } from "../models/User";
import { logger } from "./logger";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed");
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isVerified = true;
      await existing.save();
      logger.info({ email }, "Existing user promoted to admin");
    } else {
      logger.info({ email }, "Admin user already exists");
    }
    return;
  }

  await User.create({
    name: "Admin",
    email: email.toLowerCase(),
    password,
    role: "admin",
    isVerified: true,
  });

  logger.info({ email }, "Admin user created");
}
