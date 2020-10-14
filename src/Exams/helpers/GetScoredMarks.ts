/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function getScoredMarks(examDetails: any, answersCollection: any, includesNegativeMark = false): number {
  let scoredMarks = 0;
  const answers = answersCollection.answers;
  answers?.map?.(answer => {
    const questionDetails = getQuestionDetails(examDetails, answer.questionId);
    if (answer.isCorrectAnswer) {
      scoredMarks += questionDetails.mark;
    } else if (!answer.isCorrectAnswer && questionDetails?.negativeMark) {
      scoredMarks -= questionDetails.negativeMark;
    }
  });
  return scoredMarks;
}

function getQuestionDetails(examDetails, questionId): any {
  const questionIdString = typeof questionId === 'string' ? questionId : questionId.toHexString();
  const questionDetails = examDetails?.questions?.find(question => {
    const _id = typeof question._id === 'string' ? question._id : question._id.toHexString();
    return _id === questionIdString;
  });
  return questionDetails;
}
