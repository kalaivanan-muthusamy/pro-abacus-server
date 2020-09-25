import { Schema, Document } from 'mongoose';

export interface AbacusSplitUpInterface {
  digits: number;
  rows: number;
  questions: number;
  marks: number;
}

const AbacusSplitUp = {
  digits: {
    type: Number,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
  },
  questions: {
    type: Number,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
};

const ExamSplitUp = {
  additionAndSubtraction: [AbacusSplitUp],
  multiplication: [AbacusSplitUp],
  division: [AbacusSplitUp],
};

export interface ExamSplitUpInterface {
  additionAndSubtraction: [AbacusSplitUpInterface];
  multiplication: [AbacusSplitUpInterface];
  division: [AbacusSplitUpInterface];
}

export const LevelsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    splitUps: {
      type: ExamSplitUp,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface LevelsModel extends Document {
  name: string;
  splitUps: ExamSplitUpInterface;
}
