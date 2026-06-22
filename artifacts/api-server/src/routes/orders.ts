import { Router } from "express";
import { Order } from "../models/Order";
import { authenticate, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

function formatOrder(order: any) {
  return {
    id: order._id.toString(),
    itemId: order.itemId.toString(),
    itemType: order.itemType,
    itemTitle: order.itemTitle,
    itemThumbnail: order.itemThumbnail ?? null,
    amount: order.amount,
    status: order.status,
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayPaymentId: order.razorpayPaymentId ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

// GET /api/orders
router.get("/orders", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(orders.map(formatOrder));
});

// GET /api/orders/:id
router.get("/orders/:id", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await Order.findOne({ _id: raw, user: req.userId });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order));
});

export default router;
