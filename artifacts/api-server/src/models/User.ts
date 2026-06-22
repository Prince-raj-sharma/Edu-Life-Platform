import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  isVerified: boolean;
  avatar?: string;
  otp?: string;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  purchasedCourses: mongoose.Types.ObjectId[];
  purchasedPdfs: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    purchasedPdfs: [{ type: Schema.Types.ObjectId, ref: "Pdf" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
