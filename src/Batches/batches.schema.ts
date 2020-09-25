import { Schema, Document, Types } from 'mongoose';
import { BATCH_REQUEST_STATUS } from 'src/constants';

export const BatchesSchema = new Schema(
  {
    batchNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    batchOwner: {
      type: String,
      required: true,
    },
    teacherId: {
      type: Types.ObjectId,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export interface BatchesModel extends Document {
  batchNumber: string;
  name: string;
  description: string;
  batchOwner: string;
  teacherId: Types.ObjectId;
  isDeleted?: boolean;
}

export const BatchRequestsSchema = new Schema(
  {
    batchId: {
      type: Types.ObjectId,
      required: true,
    },
    teacherId: {
      type: Types.ObjectId,
      required: true,
    },
    studentId: {
      type: Types.ObjectId,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: BATCH_REQUEST_STATUS.PENDING,
    },
    expiryAt: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export interface BatchRequestsModel extends Document {
  batchId: Types.ObjectId;
  teacherId: Types.ObjectId;
  studentId: Types.ObjectId;
  requestType: string;
  status?: string;
  expiryAt: Date;
  isDeleted?: boolean;
}
