import mongoose, { Schema, type Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: "course" | "pdf";
  itemTitle: string;
  itemThumbnail?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["course", "pdf"], required: true },
    itemTitle: { type: String, required: true },
    itemThumbnail: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
