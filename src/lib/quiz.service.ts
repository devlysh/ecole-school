import { Answer, Step, QuizState } from "./types";

export const QuizService = {
  initializeQuiz: (questions: Step[]): QuizState => {
    return {
      currentStep: 0,
      answers: Array(questions.length).fill(null),
    };
  },

  goToNextStep: (state: QuizState): QuizState => {
    if (state.currentStep < state.answers.length - 1) {
      return { ...state, currentStep: state.currentStep + 1 };
    }
    return state;
  },

  goToPreviousStep: (state: QuizState): QuizState => {
    if (state.currentStep > 0) {
      return { ...state, currentStep: state.currentStep - 1 };
    }
    return state;
  },

  submitAnswer: (state: QuizState, text: string): QuizState => {
    const updatedAnswers: Answer[] = [...state.answers];
    updatedAnswers[state.currentStep] = { id: state.currentStep, text };
    return { ...state, answers: updatedAnswers };
  },

  isQuizComplete: (state: QuizState): boolean => {
    return (
      state.currentStep === state.answers.length - 1 &&
      state.answers.every((answer) => answer !== null)
    );
  },

  resetQuiz: (questions: Step[]): QuizState => {
    return QuizService.initializeQuiz(questions);
  },
};

export default QuizService;
