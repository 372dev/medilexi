import quizData from '@/data/medical_wordparts_quiz.json'
import ExamClient, { type Bundle } from './ExamClient'

/* Server shell. Ships only the bundle list (titles / free flags) to the client;
   the questions, answers, and explanations stay on the server and are delivered
   answer-stripped via /api/exam, then graded server-side by /api/exam/grade. */

const bundles = (quizData as unknown as { bundles: Bundle[] }).bundles

export default function WordPartsExamPage() {
  return <ExamClient bundles={bundles} />
}
