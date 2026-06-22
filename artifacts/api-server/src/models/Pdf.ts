import mongoose, { Schema, type Document } from "mongoose";

export interface IPdf extends Document {
  title: string;
  thumbnail: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  fileUrl?: string;
  filePublicId?: string;
  pageCount?: number;
  createdAt: Date;
}

const PdfSchema = new Schema<IPdf>(
  {
    title: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: "" },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    fileUrl: { type: String },
    filePublicId: { type: String },
    pageCount: { type: Number },
  },
  { timestamps: true }
);

export const Pdf = mongoose.model<IPdf>("Pdf", PdfSchema);
