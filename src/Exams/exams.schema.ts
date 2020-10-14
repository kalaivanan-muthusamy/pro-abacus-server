import { Schema, Document, Types } from 'mongoose';
import { RESULT_QUEUE_STATUS } from './../constants';

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
  mark: number;
  negativeMark: number;
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
  mark: {
    type: Number,
  },
  negativeMark: {
    type: Number,
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
    levelId: {
      type: Types.ObjectId,
    },
    examStartedDateTime: {
      type: Date,
    },
    examCompletedDateTime: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
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
  levelId?: Types.ObjectId;
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
  isCompleted?: boolean;
}

const AnswerSchema = {
  questionId: {
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
};

export const AnswersSchema = new Schema(
  {
    examId: {
      type: Types.ObjectId,
      required: true,
    },
    examType: {
      type: String,
      required: true,
    },
    examStartedOn: {
      type: Date,
      required: true,
    },
    examCompletedOn: {
      type: Date,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

AnswersSchema.virtual('examDetails', {
  ref: 'exams',
  localField: 'examId',
  foreignField: '_id',
  justOne: true,
});

interface AnswerInterface {
  questionId: Types.ObjectId;
  givenAnswer: number;
  answer: number;
  isCorrectAnswer: boolean;
  timeTaken: number;
}

export interface AnswersModel extends Document {
  examId: Types.ObjectId;
  examType: string;
  userId: Types.ObjectId;
  examStartedOn: Date;
  examCompletedOn?: Date;
  answers?: AnswerInterface[];
}

export const ResultsSchema = new Schema(
  {
    examId: {
      type: Types.ObjectId,
      required: true,
    },
    examType: {
      type: String,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    scoredMarks: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answeredQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    inCorrectAnswers: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
    },
    percentile: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    isWCLStar: {
      type: Boolean,
    },
    isACLStar: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

ResultsSchema.virtual('examDetails', {
  ref: 'exams',
  localField: 'examId',
  foreignField: '_id',
  justOne: true,
});

ResultsSchema.virtual('studentDetails', {
  ref: 'students',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

ResultsSchema.virtual('teacherDetails', {
  ref: 'teachers',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export interface ResultsModel extends Document {
  examId: Types.ObjectId;
  examType: string;
  userId: Types.ObjectId;
  totalMarks: number;
  scoredMarks: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  inCorrectAnswers: number;
  accuracy: number;
  speed: number;
  timeTaken: number;
  percentile: number;
  rank: number;
  isWCLStar?: boolean;
  isACLStar?: boolean;
}

export const ResultsQueueSchema = new Schema({
  examId: {
    type: Types.ObjectId,
    required: true,
  },
  preparationTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: RESULT_QUEUE_STATUS.NOT_PREPARED,
  },
});

export interface ResultsQueueModel extends Document {
  examId: Types.ObjectId;
  preparationTime: Date;
  status?: string;
}
