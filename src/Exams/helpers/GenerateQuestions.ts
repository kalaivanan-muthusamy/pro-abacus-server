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
    if (category === SPLITUP_CATEGORY.ADDITION_AND_SUBTRACTION) {
      questions.push(...generateIndividualQuestion(MATH_TYPE.ADDITION_AND_SUBTRACTION, questionConfig, negativeMarks));
    } else if (category === SPLITUP_CATEGORY.MULTIPLICATION) {
      questions.push(...generateIndividualQuestion(MATH_TYPE.MULTIPLICATION, questionConfig, negativeMarks));
    } else if (category === SPLITUP_CATEGORY.DIVISION) {
      questions.push(...generateIndividualQuestion(MATH_TYPE.DIVISION, questionConfig, negativeMarks));
    }
  });
  return questions;
}

function generateIndividualQuestion(type: string, questionConfig: any, negativeMarks: boolean): Array<any> {
  const questions = [];
  switch (type) {
    case MATH_TYPE.ADDITION_AND_SUBTRACTION: {
      const totalQuestions = questionConfig.questions;
      [...Array(totalQuestions)].map(() => {
        let rowValues = [...Array(questionConfig.rows)].map(() => getRandomDigits(questionConfig.digits));
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
        const rowValues = [getRandomDigits(questionConfig.multiplicandDigits), getRandomDigits(questionConfig.multiplierDigits)];
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
        let tempDividend = getRandomDigits(questionConfig.dividendDigits);
        let tempDivisor = getRandomDigits(questionConfig.divisorDigits);
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

function getRandomDigits(length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
}
