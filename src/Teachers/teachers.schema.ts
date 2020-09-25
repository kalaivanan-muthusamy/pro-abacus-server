import { Schema, Document } from 'mongoose';

export const TeachersSchema = new Schema(
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
  },
  {
    timestamps: true,
  },
);

export interface TeachersModel extends Document {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  centerName: string;
}
