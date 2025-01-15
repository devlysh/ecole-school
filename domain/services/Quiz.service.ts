import { QuizState, QuizStep } from "@/lib/types";

export const QuizService = {
  initializeQuiz: (steps: QuizStep[]): QuizState => ({
    currentStep: 0,
    steps,
    answers: Array(steps.length).fill(null),
  }),

  goToNextStep: (state: QuizState): QuizState =>
    state.currentStep < state.answers.length - 1
      ? { ...state, currentStep: state.currentStep + 1 }
      : state,

  goToPreviousStep: (state: QuizState): QuizState =>
    state.currentStep > 0
      ? { ...state, currentStep: state.currentStep - 1 }
      : state,

  submitAnswer: (state: QuizState, answerText: string): QuizState => {
    const updatedAnswers = [...state.answers];
    updatedAnswers[state.currentStep] = {
      id: state.steps[state.currentStep].name,
      text: answerText,
      question: state.steps[state.currentStep].text,
    };
    return { ...state, answers: updatedAnswers };
  },

  isQuizComplete: (state: QuizState): boolean =>
    state.currentStep === state.answers.length - 1 &&
    state.answers.every((answer) => answer !== null),

  resetQuiz: (steps: QuizStep[]): QuizState =>
    QuizService.initializeQuiz(steps),

  isFirstStep: (state: QuizState): boolean => state.currentStep === 0,

  isLastStep: (state: QuizState): boolean =>
    state.currentStep === state.answers.length - 1,

  calculateProgress: (state: QuizState): number =>
    (state.currentStep / (state.steps.length - 1)) * 100,
};

export const pipe =
  (prevState: QuizState) =>
  (...methods: ((state: QuizState) => QuizState)[]) =>
    methods.reduce((state, method) => {
      return method(state);
    }, prevState);
