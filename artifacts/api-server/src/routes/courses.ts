import { Router } from "express";
import { Course } from "../models/Course";
import { Progress } from "../models/Progress";
import { User } from "../models/User";
import { authenticate, requireAdmin, optionalAuth, type AuthRequest } from "../middlewares/authenticate";
import { getSignedStreamUrl } from "../lib/cloudinary";

const router = Router();

function formatLesson(lesson: any, includeVideo: boolean) {
  return {
    id: lesson._id.toString(),
    title: lesson.title,
    description: lesson.description ?? null,
    videoUrl: includeVideo ? (lesson.videoUrl ?? null) : null,
    videoPublicId: includeVideo ? (lesson.videoPublicId ?? null) : null,
    notes: includeVideo ? (lesson.notes ?? null) : null,
    duration: lesson.duration,
    order: lesson.order,
    isPreview: lesson.isPreview,
  };
}

function formatCourse(course: any, isPurchased = false) {
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
    isPurchased,
    createdAt: course.createdAt.toISOString(),
  };
}

// GET /api/courses
router.get("/courses", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const { category, difficulty, search, page = "1", limit = "12" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit) || 12);

  const filter: Record<string, any> = { isPublished: true };
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { instructor: { $regex: search, $options: "i" } },
  ];

  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  let purchasedIds: string[] = [];
  if (req.userId) {
    const user = await User.findById(req.userId).select("purchasedCourses");
    purchasedIds = user?.purchasedCourses.map((id) => id.toString()) ?? [];
  }

  res.json({
    courses: courses.map((c) => formatCourse(c, purchasedIds.includes(c._id.toString()))),
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// POST /api/courses
router.post("/courses", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { title, thumbnail, description, price, originalPrice, category, difficulty, instructor, isPublished } = req.body;
  if (!title || !description || price == null || !category || !difficulty || !instructor) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const course = await Course.create({
    title, thumbnail: thumbnail || "", description, price, originalPrice,
    category, difficulty, instructor, isPublished: isPublished ?? false,
  });

  res.status(201).json(formatCourse(course));
});

// GET /api/courses/:id
router.get("/courses/:id", optionalAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const course = await Course.findById(raw);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  let isPurchased = false;
  if (req.userId) {
    const user = await User.findById(req.userId).select("purchasedCourses role");
    isPurchased = user?.role === "admin" || user?.purchasedCourses.some((id) => id.toString() === raw) || false;
  }

  const detail = {
    ...formatCourse(course, isPurchased),
    lessons: course.lessons
      .sort((a, b) => a.order - b.order)
      .map((l) => formatLesson(l, isPurchased || l.isPreview)),
  };

  res.json(detail);
});

// PATCH /api/courses/:id
router.patch("/courses/:id", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const course = await Course.findByIdAndUpdate(raw, { $set: req.body }, { new: true });
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(formatCourse(course));
});

// DELETE /api/courses/:id
router.delete("/courses/:id", authenticate, requireAdmin, async (_req, res): Promise<void> => {
  const raw = Array.isArray(_req.params.id) ? _req.params.id[0] : _req.params.id;
  await Course.findByIdAndDelete(raw);
  res.sendStatus(204);
});

// POST /api/courses/:id/lessons
router.post("/courses/:id/lessons", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const course = await Course.findById(raw);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const { title, description, videoUrl, videoPublicId, notes, duration, order, isPreview } = req.body;
  if (!title) {
    res.status(400).json({ error: "Lesson title is required" });
    return;
  }

  course.lessons.push({ title, description, videoUrl, videoPublicId, notes, duration: duration ?? 0, order: order ?? course.lessons.length, isPreview: isPreview ?? false } as any);
  await course.save();

  const newLesson = course.lessons[course.lessons.length - 1];
  res.status(201).json(formatLesson(newLesson, true));
});

// PATCH /api/courses/:id/lessons/:lessonId
router.patch("/courses/:id/lessons/:lessonId", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const fields = ["title", "description", "videoUrl", "videoPublicId", "notes", "duration", "order", "isPreview"];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      (lesson as any)[field] = req.body[field];
    }
  }
  await course.save();

  res.json(formatLesson(lesson, true));
});

// DELETE /api/courses/:id/lessons/:lessonId
router.delete("/courses/:id/lessons/:lessonId", authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  course.lessons = course.lessons.filter((l) => l._id.toString() !== lessonId) as any;
  await course.save();
  res.sendStatus(204);
});

// GET /api/courses/:id/progress
router.get("/courses/:id/progress", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const course = await Course.findById(raw).select("lessons");
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const progress = await Progress.findOne({ user: req.userId, course: raw });
  const total = course.lessons.length;
  const completed = progress?.completedLessons ?? [];
  const percentage = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  res.json({ courseId: raw, completedLessons: completed, totalLessons: total, percentage });
});

// POST /api/courses/:id/progress
router.post("/courses/:id/progress", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { lessonId, completed } = req.body;

  const user = await User.findById(req.userId).select("purchasedCourses role");
  const isPurchased = user?.role === "admin" || user?.purchasedCourses.some((id) => id.toString() === raw);
  if (!isPurchased) {
    res.status(403).json({ error: "You must purchase this course first" });
    return;
  }

  const course = await Course.findById(raw).select("lessons");
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  let progress = await Progress.findOne({ user: req.userId, course: raw });
  if (!progress) {
    progress = new Progress({ user: req.userId, course: raw, completedLessons: [], percentage: 0 });
  }

  if (completed && !progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  } else if (!completed) {
    progress.completedLessons = progress.completedLessons.filter((id) => id !== lessonId);
  }

  const total = course.lessons.length;
  progress.percentage = total > 0 ? Math.round((progress.completedLessons.length / total) * 100) : 0;
  await progress.save();

  res.json({ courseId: raw, completedLessons: progress.completedLessons, totalLessons: total, percentage: progress.percentage });
});

// GET /api/courses/:id/stream/:lessonId
router.get("/courses/:id/stream/:lessonId", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;

  const user = await User.findById(req.userId).select("purchasedCourses role");
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const isPurchased = user?.role === "admin" || user?.purchasedCourses.some((id) => id.toString() === courseId);
  if (!isPurchased && !lesson.isPreview) {
    res.status(403).json({ error: "Purchase required to access this lesson" });
    return;
  }

  if (!lesson.videoPublicId) {
    res.status(404).json({ error: "No video for this lesson" });
    return;
  }

  const streamUrl = await getSignedStreamUrl(lesson.videoPublicId);
  res.json({ streamUrl });
});

export default router;
