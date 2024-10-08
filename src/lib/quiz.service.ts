import { Answer, Step, QuizState } from "./types";

export const QuizService = {
  initializeQuiz: (questions: Step[]): QuizState => ({
    currentStep: 0,
    answers: Array(questions.length).fill(null),
  }),

  goToNextStep: (state: QuizState): QuizState =>
    state.currentStep < state.answers.length - 1
      ? { ...state, currentStep: state.currentStep + 1 }
      : state,

  goToPreviousStep: (state: QuizState): QuizState =>
    state.currentStep > 0
      ? { ...state, currentStep: state.currentStep - 1 }
      : state,

  submitAnswer: (
    state: QuizState,
    questionText: string,
    answerText: string
  ): QuizState => {
    const updatedAnswers: Answer[] = [...state.answers];
    updatedAnswers[state.currentStep] = {
      id: state.currentStep,
      text: answerText,
      question: questionText,
    };
    return { ...state, answers: updatedAnswers };
  },

  isQuizComplete: (state: QuizState): boolean =>
    state.currentStep === state.answers.length - 1 &&
    state.answers.every((answer) => answer !== null),

  resetQuiz: (questions: Step[]): QuizState =>
    QuizService.initializeQuiz(questions),

  isFirstStep: (state: QuizState): boolean => state.currentStep === 0,

  isLastStep: (state: QuizState): boolean =>
    state.currentStep === state.answers.length - 1,

  calculateProgress: (state: QuizState, questions: Step[]): number =>
    (state.currentStep / (questions.length - 1)) * 100,
};

export default QuizService;
