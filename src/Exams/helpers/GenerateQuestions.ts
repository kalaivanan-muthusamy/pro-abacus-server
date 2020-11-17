/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MATH_TYPE } from 'src/constants';
import { ExamSplitUpInterface } from '../exams.schema';
import { SPLITUP_CATEGORY } from 'src/constants';

export function generateAllQuestions(splitUps: ExamSplitUpInterface, negativeMarks = false): any {
  let questions = [];
  Object.keys(splitUps).map(categoryKey => {
    const splitUp = splitUps[categoryKey];
    questions.push(...generateQuestions(categoryKey, splitUp, negativeMarks));
  });
  questions = questions.map((question, index) => ({ questionNo: ++index, ...question }));
  return questions;
}

export function generateQuestions(category: string, splitUps: any, negativeMarks: boolean): Array<any> {
  const questions = [];
  splitUps.map(questionConfig => {
    questions.push(...generateIndividualQuestion(category, questionConfig, negativeMarks));
  });
  return questions;
}

function generateIndividualQuestion(type: string, questionConfig: any, negativeMarks: boolean): Array<any> {
  const questions = [];
  switch (type) {
    case MATH_TYPE.ADDITION_AND_SUBTRACTION: {
      const totalQuestions = questionConfig.questions;
      [...Array(totalQuestions)].map(() => {
        let rowValues = [...Array(questionConfig.rows)].map(() => getRandomDigits({ length: questionConfig.digits }));
        rowValues = rowValues.sort().reverse();
        rowValues = rowValues.map((a, index) => (index % 2 !== 0 ? -a : a));
        questions.push({
          type,
          digits: questionConfig.digits,
          rows: questionConfig.rows,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      break;
    }
    case MATH_TYPE.MULTIPLICATION: {
      const totalQuestions = questionConfig.questions;
      [...Array(totalQuestions)].map(() => {
        const multiplicand = getRandomDigits({ length: questionConfig.multiplicandDigits, ignore: [0, 1] });
        const multiplier = getRandomDigits({ length: questionConfig.multiplicandDigits, ignore: [0, 1, multiplicand] });
        const rowValues = [multiplicand, multiplier];
        questions.push({
          type,
          multiplicandDigits: questionConfig.multiplicandDigits,
          multiplierDigits: questionConfig.multiplierDigits,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      break;
    }
    case MATH_TYPE.DIVISION: {
      const totalQuestions = questionConfig.questions;
      [...Array(totalQuestions)].map(() => {
        let tempDividend = getRandomDigits({ length: questionConfig.dividendDigits, ignore: [0, 1] });
        let tempDivisor = getRandomDigits({ length: questionConfig.divisorDigits, ignore: [0, 1, tempDividend] });
        if (tempDividend < tempDivisor) {
          const temp = tempDividend;
          tempDividend = tempDivisor;
          tempDivisor = temp;
        }
        if (!Number.isInteger(tempDividend / tempDivisor)) {
          const modulusValue = tempDividend % tempDivisor;
          if (Number(tempDividend - modulusValue).toString().length === questionConfig.dividendDigits) {
            tempDividend = tempDividend - modulusValue;
          } else {
            const tempModulus = tempDivisor % modulusValue;
            tempDividend = tempDividend + tempModulus;
          }
        }
        const dividend = tempDividend;
        const divisor = tempDivisor;
        const rowValues = [dividend, divisor];
        questions.push({
          type,
          dividendDigits: questionConfig.dividendDigits,
          divisorDigits: questionConfig.divisorDigits,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      break;
    }
  }
  return questions;
}

function getAnswer(type: string, rowValues: Array<number>): any {
  switch (type) {
    case MATH_TYPE.ADDITION_AND_SUBTRACTION: {
      return rowValues.reduce((acc, cur) => acc + cur, 0);
    }
    case MATH_TYPE.MULTIPLICATION: {
      return rowValues[0] * rowValues[1];
    }
    case MATH_TYPE.DIVISION: {
      return rowValues[0] / rowValues[1];
    }
  }
}

function getRandomDigits({ length, ignore = [] }) {
  let digit = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  while (ignore.includes(digit)) {
    digit = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  }
  return digit;
}
