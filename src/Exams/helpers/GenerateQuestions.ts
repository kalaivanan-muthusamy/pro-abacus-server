/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MATH_TYPE } from 'src/constants';
import { ExamSplitUpInterface } from '../exams.schema';
import { isNumArrayEqual } from 'src/Helpers/Common';

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
      const additionQuestions = [];
      const totalQuestions = questionConfig.questions;
      [...Array(totalQuestions)].map(() => {
        let isQuestionExist = true;
        let rowValues;
        while (isQuestionExist) {
          rowValues = [...Array(questionConfig.rows)].reduce(acc => {
            let num = getRandomDigits({ length: questionConfig.digits, ignore: [0, 1] });
            while (acc.includes(num)) {
              num = getRandomDigits({ length: questionConfig.digits, ignore: [0, 1] });
            }
            return [...acc, num];
          }, []);
          rowValues = rowValues.sort((a, b) => a - b).reverse();
          rowValues = rowValues.map((a, index) => (index % 2 !== 0 ? -a : a));
          isQuestionExist = additionQuestions.find(
            question => question.rowValues.length === rowValues.length && isNumArrayEqual(question.rowValues, rowValues, true),
          );
        }

        additionQuestions.push({
          type,
          digits: questionConfig.digits,
          rows: questionConfig.rows,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      questions.push(...additionQuestions);
      break;
    }
    case MATH_TYPE.MULTIPLICATION: {
      const totalQuestions = questionConfig.questions;
      const multiplicationQuestions = [];
      [...Array(totalQuestions)].map(() => {
        let isQuestionExist = true;
        let rowValues;
        while (isQuestionExist) {
          const multiplicand = getRandomDigits({ length: questionConfig.multiplicandDigits, ignore: [0, 1] });
          const multiplier = getRandomDigits({ length: questionConfig.multiplicandDigits, ignore: [0, 1, multiplicand] });
          rowValues = [multiplicand, multiplier];
          isQuestionExist = multiplicationQuestions.find(
            question => question.rowValues.length === rowValues.length && isNumArrayEqual(question.rowValues, rowValues, true),
          );
        }
        multiplicationQuestions.push({
          type,
          multiplicandDigits: questionConfig.multiplicandDigits,
          multiplierDigits: questionConfig.multiplierDigits,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      questions.push(...multiplicationQuestions);
      break;
    }
    case MATH_TYPE.DIVISION: {
      const totalQuestions = questionConfig.questions;
      const divisionQuestions = [];
      [...Array(totalQuestions)].map(() => {
        let isQuestionExist = true;
        let rowValues;
        while (isQuestionExist) {
          let tempDividend = getRandomDigits({ length: questionConfig.dividendDigits, ignore: [0, 1] });
          let tempDivisor = getRandomDigits({ length: questionConfig.divisorDigits, ignore: [0, 1, tempDividend] });
          if (tempDividend < tempDivisor) {
            const temp = tempDividend;
            tempDividend = tempDivisor;
            tempDivisor = temp;
          }
          if (!Number.isInteger(tempDividend / tempDivisor)) {
            const modulusValue = tempDividend % tempDivisor;
            const tempDivided2 = tempDividend - modulusValue;
            if (Number(tempDivided2).toString().length === questionConfig.dividendDigits) {
              tempDividend = tempDividend - modulusValue;
            } else {
              tempDividend = tempDivided2 + tempDivisor;
            }
          }
          const dividend = tempDividend;
          const divisor = tempDivisor;
          rowValues = [dividend, divisor];
          isQuestionExist =
            dividend === divisor ||
            divisionQuestions.find(
              question => question.rowValues.length === rowValues.length && isNumArrayEqual(question.rowValues, rowValues, true),
            );
        }

        divisionQuestions.push({
          type,
          dividendDigits: questionConfig.dividendDigits,
          divisorDigits: questionConfig.divisorDigits,
          rowValues: rowValues,
          answer: getAnswer(type, rowValues),
          mark: questionConfig?.marks,
          negativeMark: negativeMarks ? questionConfig?.marks : undefined,
        });
      });
      questions.push(...divisionQuestions);
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
