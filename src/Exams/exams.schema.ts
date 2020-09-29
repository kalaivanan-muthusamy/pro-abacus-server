import { Schema, Document, Types } from 'mongoose';
import { Type } from 'aws-sdk/clients/cloudformation';

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

export interface QuestionInterface {
  _id: Types.ObjectId;
  questionNo: number;
  type: string;
  digits: number;
  totalRows: number;
  rowValues: Array<number>;
  answer: number;
  givenAnswer: number;
  isCorrectAnswer: boolean;
  clientSubmittedTime: Date;
  serverSubmittedTime: Date;
}

const Questions = {
  questionNo: {
    type: Number,
  },
  type: {
    type: String,
  },
  digits: {
    type: Number,
  },
  totalRows: {
    type: Number,
  },
  rowValues: {
    type: [Number],
  },
  answer: {
    type: Number,
  },
  givenAnswer: {
    type: Number,
  },
  isCorrectAnswer: {
    type: Boolean,
  },
  clientSubmittedTime: {
    type: Date,
  },
  serverSubmittedTime: {
    type: Date,
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

export const ExamSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
    },
    examType: {
      type: String,
      required: true,
    },
    examCategory: {
      type: String,
      default: 'SIMPLE_ABACUS_EXAM',
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
    },
    resultDelay: {
      type: Number,
    },
    negativeMarks: {
      type: Boolean,
    },
    skipQuestions: {
      type: Boolean,
    },
    shuffleQuestions: {
      type: Boolean,
    },
    splitUps: {
      type: ExamSplitUp,
    },
    questions: {
      type: [Questions],
    },
    examDate: {
      type: Date,
    },
    batchIds: {
      type: [Types.ObjectId],
    },
    examStartedDateTime: {
      type: Date,
    },
    examCompletedDateTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export interface ExamModel extends Document {
  userId?: Types.ObjectId;
  examType: string;
  examCategory: string;
  examDate?: Date;
  batchIds?: Types.ObjectId[];
  name?: string;
  description?: string;
  duration?: number;
  resultDelay?: number;
  negativeMarks?: boolean;
  shuffleQuestions?: boolean;
  skipQuestions?: boolean;
  splitUps: ExamSplitUpInterface;
  questions: QuestionInterface[];
  examStartedDateTime?: Date;
  examCompletedDateTime?: Date;
}

export const AnswerSchema = new Schema(
  {
    examId: {
      type: Types.ObjectId,
      required: true,
    },
    questionId: {
      type: Types.ObjectId,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    givenAnswer: {
      type: Number,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
    },
    isCorrectAnswer: {
      type: Boolean,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface AnswerModel extends Document {
  examId: Types.ObjectId;
  questionId: Types.ObjectId;
  userId: Types.ObjectId;
  givenAnswer: number;
  answer: number;
  isCorrectAnswer: boolean;
  timeTaken: number;
}
