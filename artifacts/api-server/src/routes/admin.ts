import { Router } from "express";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { Pdf } from "../models/Pdf";
import { Order } from "../models/Order";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

function formatUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar ?? null,
    purchasedCourses: user.purchasedCourses?.map((id: any) => id.toString()) ?? [],
    purchasedPdfs: user.purchasedPdfs?.map((id: any) => id.toString()) ?? [],
    createdAt: user.createdAt.toISOString(),
  };
}

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

function formatCourse(course: any) {
  return {
    id: course._id.toString(),
    title: course.title,
    thumbnail: course.thumbnail,
    description: course.description,
    price: course.price,
    originalPrice: course.originalPrice ?? null,
    category: course.category,
    difficulty: course.difficulty,
    instructor: course.instructor,
    totalLessons: course.lessons?.length ?? 0,
    totalDuration: course.lessons?.reduce((sum: number, l: any) => sum + (l.duration ?? 0), 0) ?? 0,
    isPublished: course.isPublished,
    rating: course.rating ?? null,
    totalStudents: course.totalStudents ?? 0,
    createdAt: course.createdAt.toISOString(),
  };
}

// GET /api/admin/stats
router.get("/admin/stats", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const [totalUsers, totalCourses, totalPdfs, totalOrders, revenueResult, recentOrders, topCourses] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Pdf.countDocuments(),
    Order.countDocuments({ status: "completed" }),
    Order.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.find({ status: "completed" }).sort({ createdAt: -1 }).limit(5),
    Course.find().sort({ totalStudents: -1 }).limit(5),
  ]);

  res.json({
    totalUsers,
    totalCourses,
    totalPdfs,
    totalOrders,
    totalRevenue: revenueResult[0]?.total ?? 0,
    recentOrders: recentOrders.map(formatOrder),
    topCourses: topCourses.map(formatCourse),
  });
});

// GET /api/admin/users
router.get("/admin/users", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { page = "1", limit = "20", search } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);

  const filter: Record<string, any> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);

  res.json({ users: users.map(formatUser), total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// PATCH /api/admin/users/:id
router.patch("/admin/users/:id", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const allowed = ["name", "role", "isVerified"];
  const update: Record<string, any> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(raw, { $set: update }, { new: true });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

// DELETE /api/admin/users/:id
router.delete("/admin/users/:id", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const raw = Array.isArray(_req.params.id) ? _req.params.id[0] : _req.params.id;
  await User.findByIdAndDelete(raw);
  res.sendStatus(204);
});

// GET /api/admin/orders
router.get("/admin/orders", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);

  const total = await Order.countDocuments();
  const orders = await Order.find().sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);

  res.json({ orders: orders.map(formatOrder), total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// GET /api/admin/revenue
router.get("/admin/revenue", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const [totalResult, courseResult, pdfResult, monthly] = await Promise.all([
    Order.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.aggregate([{ $match: { status: "completed", itemType: "course" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.aggregate([{ $match: { status: "completed", itemType: "pdf" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  res.json({
    totalRevenue: totalResult[0]?.total ?? 0,
    courseRevenue: courseResult[0]?.total ?? 0,
    pdfRevenue: pdfResult[0]?.total ?? 0,
    monthlyRevenue: monthly.map((m) => ({
      month: `${monthNames[(m._id.month as number) - 1]} ${m._id.year}`,
      revenue: m.revenue,
      orders: m.orders,
    })),
  });
});

export default router;
