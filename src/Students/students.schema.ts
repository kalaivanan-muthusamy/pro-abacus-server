import { Schema, Document, Types } from 'mongoose';

const SubscriptionDetails = new Schema({
  expiryAt: {
    type: Date,
    required: true,
  },
});

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
    levelId: {
      type: Types.ObjectId,
      required: true,
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
    subscriptionDetails: {
      _id: false,
      type: SubscriptionDetails,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

StudentsSchema.virtual('levelDetails', {
  ref: 'levels',
  localField: 'levelId',
  foreignField: '_id',
  justOne: true,
});

StudentsSchema.virtual('batchDetails', {
  ref: 'batches',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true,
});

interface SubscriptionDetailsInterface {
  expiryAt: Date;
}

export interface StudentsModel extends Document {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  levelId: Types.ObjectId;
  batchId?: Types.ObjectId;
  profileImage?: string;
  emailVerificationHash?: string;
  emailVerified?: boolean;
  forgotPasswordHash?: string;
  forgotPasswordExpiryDate?: Date;
  subscriptionDetails?: SubscriptionDetailsInterface;
  enabled?: boolean;
}
