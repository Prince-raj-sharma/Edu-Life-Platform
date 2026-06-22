import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/Course";
import { Pdf } from "../models/Pdf";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// POST /api/payments/create-order
router.post("/payments/create-order", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { itemId, itemType } = req.body;
  if (!itemId || !itemType) {
    res.status(400).json({ error: "itemId and itemType are required" });
    return;
  }

  let item: any;
  if (itemType === "course") {
    item = await Course.findById(itemId);
  } else if (itemType === "pdf") {
    item = await Pdf.findById(itemId);
  }

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  // Check if already purchased
  const user = await User.findById(req.userId).select("purchasedCourses purchasedPdfs");
  if (itemType === "course" && user?.purchasedCourses.some((id) => id.toString() === itemId)) {
    res.status(400).json({ error: "You have already purchased this course" });
    return;
  }
  if (itemType === "pdf" && user?.purchasedPdfs.some((id) => id.toString() === itemId)) {
    res.status(400).json({ error: "You have already purchased this PDF" });
    return;
  }

  const amountInPaise = Math.round(item.price * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: { itemId, itemType, userId: req.userId },
  });

  res.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/payments/verify
router.post("/payments/verify", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, itemId, itemType } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !itemId || !itemType) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  // Verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  // Find item
  let item: any;
  if (itemType === "course") {
    item = await Course.findById(itemId);
  } else if (itemType === "pdf") {
    item = await Pdf.findById(itemId);
  }

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  // Save order
  const order = await Order.create({
    user: req.userId,
    itemId,
    itemType,
    itemTitle: item.title,
    itemThumbnail: item.thumbnail || null,
    amount: item.price,
    status: "completed",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  // Grant access
  const user = await User.findById(req.userId);
  if (user) {
    if (itemType === "course") {
      if (!user.purchasedCourses.some((id) => id.toString() === itemId)) {
        user.purchasedCourses.push(item._id);
        await Course.findByIdAndUpdate(itemId, { $inc: { totalStudents: 1 } });
      }
    } else if (itemType === "pdf") {
      if (!user.purchasedPdfs.some((id) => id.toString() === itemId)) {
        user.purchasedPdfs.push(item._id);
      }
    }
    await user.save();
  }

  res.json({ success: true, orderId: order._id.toString(), message: "Payment verified and access granted" });
});

export default router;
