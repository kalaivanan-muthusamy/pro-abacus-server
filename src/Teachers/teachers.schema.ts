import { Schema, Document } from 'mongoose';

const SubscriptionDetails = new Schema({
  expiryAt: {
    type: Date,
    required: true,
  },
});

export const TeachersSchema = new Schema(
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
    centerName: {
      type: String,
      required: true,
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
    subscriptionDetails: {
      _id: false,
      type: SubscriptionDetails,
    },
  },
  {
    timestamps: true,
  },
);

interface SubscriptionDetailsInterface {
  expiryAt: Date;
}

export interface TeachersModel extends Document {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  centerName: string;
  profileImage?: string;
  emailVerificationHash?: string;
  emailVerified?: boolean;
  forgotPasswordHash?: string;
  forgotPasswordExpiryDate?: Date;
  subscriptionDetails?: SubscriptionDetailsInterface;
}
