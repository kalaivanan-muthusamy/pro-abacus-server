import { Schema, Document } from 'mongoose';

export const AdminsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export interface AdminsModel extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}
