/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getFormattedNumber } from 'src/Helpers/Math';
import * as moment from 'moment';

export function getAverageSpeed(exams: any): any {
  let totalSpeed = 0;
  const totalExams = exams.length;
  exams?.map?.(exam => {
    let speed = 0;
    const answeredQuestions = exam.answers?.length; // 15
    const duration = exam.examDetails?.duration; // 10 min
    const timeForOneQuestion = (duration * 60) / answeredQuestions; // 30 seconds
    speed = 3600 / timeForOneQuestion;
    totalSpeed += speed;
  });

  const avgSpeed = totalSpeed / totalExams;

  return avgSpeed || 0;
}

export function getAverageSpeedFromResult(results: any): any {
  const totalSpeed = results?.reduce?.((acc, cur) => acc + cur.speed, 0);
  return getFormattedNumber(totalSpeed / results?.length);
}

export function getAverageAccuracyFromResult(results: any): any {
  const totalAccuracy = results?.reduce?.((acc, cur) => acc + cur.accuracy, 0);
  return getFormattedNumber(totalAccuracy / results?.length);
}

export function getAverageDurationFromResult(results: any): any {
  const totalTimeTaken = results?.reduce?.((acc, cur) => acc + cur.timeTaken, 0);
  return getFormattedNumber(totalTimeTaken / results?.length);
}

export function getAverageDuration(exams: any): any {
  let totalTimeTaken = 0;
  const totalExams = exams.length;
  exams?.map?.(exam => {
    const timeTaken = exam.answers?.reduce((acc, cur) => acc + cur.timeTaken, 0);
    totalTimeTaken += timeTaken;
  });

  const avgDuration = totalTimeTaken / totalExams;

  return parseFloat(avgDuration.toFixed(2)) || 0;
}

export function getAverageAccuracy(exams: any): any {
  let totalAccuracy = 0;
  const totalExams = exams.length;
  exams?.map?.(exam => {
    let accuracy = 0;
    const totalQuestions = exam.examDetails?.questions?.length;
    const correctAnswers = exam.answers?.filter(answer => answer.isCorrectAnswer).length;
    accuracy = (correctAnswers / totalQuestions) * 100;
    totalAccuracy += accuracy;
  });

  const avgAccuracy = totalAccuracy / totalExams;

  return parseFloat(avgAccuracy.toFixed(2)) || 0;
}

export function calculateTimeTaken({ startTime, endTime, examDuration }): number {
  const examStartedTime = moment(startTime);
  const examCompletedTime = moment(endTime);
  let timeTaken = examCompletedTime.diff(examStartedTime, 'seconds', true);

  // Due to network latency, it is possible that minor difference in time taken.
  // Time taken to complete the exam should never exceed the duration and should
  // never be in negative
  // timeTaken -= 3;
  
  const examDurationInSeconds = examDuration * 60;
  if (examDurationInSeconds && timeTaken > examDurationInSeconds) {
    timeTaken = examDurationInSeconds;
  }
  if (timeTaken < 0) {
    timeTaken = 0;
  }

  return getFormattedNumber(timeTaken, 0);
}
