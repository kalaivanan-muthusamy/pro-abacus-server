import { Schema, Document, Types } from 'mongoose';
import { PAYMENT_STATUSES } from './../constants';

export const PricingPlansSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    basicPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    validity: {
      type: String,
    },
    planType: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface PricingPlansModel extends Document {
  name: string;
  basicPrice: number;
  discountedPrice: number;
  validity?: number;
  planType: string;
  examType?: string;
  currency?: string;
  currencySymbol?: string;
}

export const TransactionsSchema = new Schema(
  {
    pricingPlanId: {
      type: Types.ObjectId,
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      required: true,
      default: '₹',
    },
    initiatedOn: {
      type: Date,
      required: true,
    },
    completedOn: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: PAYMENT_STATUSES.INITIATED,
    },
    transactionDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

TransactionsSchema.virtual('pricingPlanDetails', {
  ref: 'pricingplans',
  localField: 'pricingPlanId',
  foreignField: '_id',
  justOne: true,
});

export interface TransactionsModel extends Document {
  pricingPlanId: Types.ObjectId;
  planType: string;
  userId: Types.ObjectId;
  role: string;
  paymentAmount: number;
  paymentStatus?: string;
  currency?: string;
  currencySymbol?: string;
  initiatedOn: Date;
  completedOn?: Date;
  transactionDetails?: any;
}

export const SubscriptionHistorySchema = new Schema(
  {
    transactionId: {
      type: Types.ObjectId,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    pricingPlanId: {
      type: Types.ObjectId,
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

SubscriptionHistorySchema.virtual('pricingPlanDetails', {
  ref: 'pricingplans',
  localField: 'pricingPlanId',
  foreignField: '_id',
  justOne: true,
});

SubscriptionHistorySchema.virtual('transactionDetails', {
  ref: 'transactions',
  localField: 'transactionId',
  foreignField: '_id',
  justOne: true,
});

export interface SubscriptionHistoryModel extends Document {
  transactionId: Types.ObjectId;
  pricingPlanId: Types.ObjectId;
  userId: Types.ObjectId;
  fromDate: Date;
  toDate: Date;
}
