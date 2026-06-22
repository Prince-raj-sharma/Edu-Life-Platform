import { Router } from "express";
import { Pdf } from "../models/Pdf";
import { User } from "../models/User";
import { authenticate, requireAdmin, optionalAuth, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

function formatPdf(pdf: any, isPurchased = false) {
  return {
    id: pdf._id.toString(),
    title: pdf.title,
    thumbnail: pdf.thumbnail,
    description: pdf.description,
    price: pdf.price,
    originalPrice: pdf.originalPrice ?? null,
    category: pdf.category,
    fileUrl: isPurchased ? (pdf.fileUrl ?? null) : null,
    isPurchased,
    pageCount: pdf.pageCount ?? null,
    createdAt: pdf.createdAt.toISOString(),
  };
}

// GET /api/pdfs
router.get("/pdfs", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const { category, search, page = "1", limit = "12" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit) || 12);

  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];

  const total = await Pdf.countDocuments(filter);
  const pdfs = await Pdf.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);

  let purchasedIds: string[] = [];
  if (req.userId) {
    const user = await User.findById(req.userId).select("purchasedPdfs role");
    if (user?.role === "admin") {
      purchasedIds = pdfs.map((p) => p._id.toString());
    } else {
      purchasedIds = user?.purchasedPdfs.map((id) => id.toString()) ?? [];
    }
  }

  res.json({
    pdfs: pdfs.map((p) => formatPdf(p, purchasedIds.includes(p._id.toString()))),
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// POST /api/pdfs
router.post("/pdfs", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { title, thumbnail, description, price, originalPrice, category, fileUrl, filePublicId, pageCount } = req.body;
  if (!title || !description || price == null || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const pdf = await Pdf.create({ title, thumbnail: thumbnail || "", description, price, originalPrice, category, fileUrl, filePublicId, pageCount });
  res.status(201).json(formatPdf(pdf, true));
});

// GET /api/pdfs/:id
router.get("/pdfs/:id", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const pdf = await Pdf.findById(raw);
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  let isPurchased = false;
  if (req.userId) {
    const user = await User.findById(req.userId).select("purchasedPdfs role");
    isPurchased = user?.role === "admin" || user?.purchasedPdfs.some((id) => id.toString() === raw) || false;
  }

  res.json(formatPdf(pdf, isPurchased));
});

// PATCH /api/pdfs/:id
router.patch("/pdfs/:id", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const pdf = await Pdf.findByIdAndUpdate(raw, { $set: req.body }, { new: true });
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }
  res.json(formatPdf(pdf, true));
});

// DELETE /api/pdfs/:id
router.delete("/pdfs/:id", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const raw = Array.isArray(_req.params.id) ? _req.params.id[0] : _req.params.id;
  await Pdf.findByIdAndDelete(raw);
  res.sendStatus(204);
});

// GET /api/pdfs/:id/download
router.get("/pdfs/:id/download", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const pdf = await Pdf.findById(raw);
  if (!pdf) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }

  const user = await User.findById(req.userId).select("purchasedPdfs role");
  const isPurchased = user?.role === "admin" || user?.purchasedPdfs.some((id) => id.toString() === raw) || false;
  if (!isPurchased) {
    res.status(403).json({ error: "Purchase required to access this PDF" });
    return;
  }

  if (!pdf.fileUrl) {
    res.status(404).json({ error: "No file for this PDF" });
    return;
  }

  res.json({ downloadUrl: pdf.fileUrl });
});

export default router;
