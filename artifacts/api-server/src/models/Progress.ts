import mongoose, { Schema, type Document } from "mongoose";

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completedLessons: string[];
  percentage: number;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: String }],
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>("Progress", ProgressSchema);
