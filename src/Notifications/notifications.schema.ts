import { Schema, Document, Types } from 'mongoose';
import { NotificationInterface } from './interface/NotificationInterface';

export const NotificationsSchema = new Schema(
  {
    senderRole: {
      type: String,
      required: true,
    },
    senderId: {
      type: Types.ObjectId,
      required: true,
    },
    audience: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isBatchNotification: {
      type: Boolean,
      default: false,
    },
    to: {
      type: [Types.ObjectId],
    },
    message: {
      type: String,
    },
    examId: {
      type: Types.ObjectId,
    },
    batchRequestId: {
      type: Types.ObjectId,
    },
    expiryAt: {
      type: Date,
      required: true,
    },
    notificationDate: {
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

export interface NotificationsModel extends NotificationInterface, Document {}
