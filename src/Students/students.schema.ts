import { Schema, Document, Types } from 'mongoose';

export const StudentsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
    },
    batchId: {
      type: Types.ObjectId,
    },
    profileImage: {
      type: String,
    },
    emailVerificationHash: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordHash: {
      type: String,
    },
    forgotPasswordExpiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export interface StudentsModel extends Document {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  level?: string;
  batchId?: Types.ObjectId;
  profileImage?: string;
  emailVerificationHash?: string;
  emailVerified?: boolean;
  forgotPasswordHash?: string;
  forgotPasswordExpiryDate?: Date;
}
