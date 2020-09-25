import { Types } from 'mongoose';

export interface NotificationInterface {
  senderRole: string;
  senderId: Types.ObjectId;
  audience: string;
  type: string;
  isBatchNotification?: boolean;
  to: Types.ObjectId[];
  message: string;
  examId?: Types.ObjectId;
  batchRequestId?: Types.ObjectId;
  expiryAt: Date;
  notificationDate: Date;
  isDeleted?: boolean;
}
