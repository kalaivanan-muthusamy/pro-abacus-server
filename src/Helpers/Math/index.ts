import { DEFAULT_DECIMAL_ROUND } from './../../configs';

export function getAddition(numberA: number, numberB: number, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  return parseFloat((numberA + numberB).toFixed(decimalValue));
}

export function getMultiplication(numberA: number, numberB: number, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  return parseFloat((numberA * numberB).toFixed(decimalValue));
}

export function getDivision(numberA: number, numberB: number, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  return parseFloat((numberA / numberB).toFixed(decimalValue));
}

export function getSubtraction(numberA: number, numberB: number, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  return parseFloat((numberA - numberB).toFixed(decimalValue));
}

export function getFormattedNumber(number: number, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  let num = typeof number === 'number' ? number : parseFloat(number);
  Number.isNaN(num) && (num = 0);
  return parseFloat(num.toFixed(decimalValue));
}

export function getPercentageValue(value: number, percentage: number, percentageFor = 100, decimalValue = DEFAULT_DECIMAL_ROUND): number {
  return parseFloat(((percentage / percentageFor) * value).toFixed(decimalValue));
}
