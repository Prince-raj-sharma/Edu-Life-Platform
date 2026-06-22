import mongoose, { Schema, type Document } from "mongoose";

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  videoUrl?: string;
  videoPublicId?: string;
  notes?: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

export interface ICourse extends Document {
  title: string;
  thumbnail: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructor: string;
  lessons: ILesson[];
  isPublished: boolean;
  rating?: number;
  totalStudents: number;
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  videoPublicId: { type: String },
  notes: { type: String },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  isPreview: { type: Boolean, default: false },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: "" },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    instructor: { type: String, required: true },
    lessons: [LessonSchema],
    isPublished: { type: Boolean, default: false },
    rating: { type: Number },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
