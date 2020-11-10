export function getMonthByNumber(number: number, fullText = false, indexStart = 0): string {
  const monthsLong = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthsSmall = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  if (fullText) {
    return monthsLong[number - indexStart];
  }
  return monthsSmall[number - indexStart];
}
