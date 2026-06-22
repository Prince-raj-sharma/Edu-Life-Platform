import { Router } from "express";
import { uploadImage, uploadVideo, uploadPdfFile } from "../lib/cloudinary";
import { authenticate, requireAdmin, type AuthRequest } from "../middlewares/authenticate";

const router = Router();

// POST /api/upload/image
router.post("/upload/image", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "No image data provided" });
    return;
  }
  const result = await uploadImage(data);
  res.json({ url: result.url, publicId: result.publicId });
});

// POST /api/upload/video
router.post("/upload/video", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "No video data provided" });
    return;
  }
  const result = await uploadVideo(data);
  res.json({ url: result.url, publicId: result.publicId, duration: result.duration ?? null });
});

// POST /api/upload/pdf
router.post("/upload/pdf", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "No PDF data provided" });
    return;
  }
  const result = await uploadPdfFile(data);
  res.json({ url: result.url, publicId: result.publicId, duration: null });
});

export default router;
