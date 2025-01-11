import { QuizService } from "./QuizService";
import { QuizStep, QuizState, StepType } from "@/lib/types";

const steps: QuizStep[] = [
  {
    type: StepType.QUESTION,
    name: "1",
    text: "Question 1",
    answers: [],
    allowCustomAnswer: false,
  },
  {
    type: StepType.QUESTION,
    name: "2",
    text: "Question 2",
    answers: [],
    allowCustomAnswer: false,
  },
  {
    type: StepType.QUESTION,
    name: "3",
    text: "Question 3",
    answers: [],
    allowCustomAnswer: false,
  },
];

describe("QuizService", () => {
  let initialState: QuizState;

  beforeEach(() => {
    initialState = QuizService.initializeQuiz(steps);
  });

  test("initializeQuiz should set up initial state correctly", () => {
    expect(initialState).toEqual({
      currentStep: 0,
      steps,
      answers: [null, null, null],
    });
  });

  test("goToNextStep should move to the next step if not the last step", () => {
    const nextState = QuizService.goToNextStep(initialState);
    expect(nextState.currentStep).toBe(1);
  });

  test("goToNextStep should not go past the last step", () => {
    let state = initialState;
    for (let i = 0; i < steps.length; i++) {
      state = QuizService.goToNextStep(state);
    }
    expect(state.currentStep).toBe(steps.length - 1);
  });

  test("goToPreviousStep should move to the previous step if not the first step", () => {
    const stateWithNextStep = QuizService.goToNextStep(initialState);
    const prevState = QuizService.goToPreviousStep(stateWithNextStep);
    expect(prevState.currentStep).toBe(0);
  });

  test("goToPreviousStep should not go below the first step", () => {
    const prevState = QuizService.goToPreviousStep(initialState);
    expect(prevState.currentStep).toBe(0);
  });

  test("submitAnswer should record the answer correctly", () => {
    const answerText = "Answer to question 1";
    const stateWithAnswer = QuizService.submitAnswer(initialState, answerText);
    expect(stateWithAnswer.answers[0]).toEqual({
      id: steps[0].name,
      text: answerText,
      question: "Question 1",
    });
  });

  test("isQuizComplete should return false if quiz is not fully answered", () => {
    const partialState = QuizService.submitAnswer(initialState, "Answer 1");
    expect(QuizService.isQuizComplete(partialState)).toBe(false);
  });

  test("isQuizComplete should return true if all questions are answered", () => {
    let state = initialState;
    for (let i = 0; i < steps.length; i++) {
      state = QuizService.submitAnswer(state, `Answer ${i + 1}`);
      state = QuizService.goToNextStep(state);
    }
    expect(QuizService.isQuizComplete(state)).toBe(true);
  });

  test("resetQuiz should reinitialize the quiz to the initial state", () => {
    const resetState = QuizService.resetQuiz(steps);
    expect(resetState).toEqual(initialState);
  });

  test("isFirstStep should return true if current step is the first step", () => {
    expect(QuizService.isFirstStep(initialState)).toBe(true);
  });

  test("isFirstStep should return false if current step is not the first step", () => {
    const stateWithNextStep = QuizService.goToNextStep(initialState);
    expect(QuizService.isFirstStep(stateWithNextStep)).toBe(false);
  });

  test("isLastStep should return true if current step is the last step", () => {
    let state = initialState;
    for (let i = 0; i < steps.length - 1; i++) {
      state = QuizService.goToNextStep(state);
    }
    expect(QuizService.isLastStep(state)).toBe(true);
  });

  test("isLastStep should return false if current step is not the last step", () => {
    expect(QuizService.isLastStep(initialState)).toBe(false);
  });

  test("calculateProgress should return correct progress percentage", () => {
    let state = initialState;
    expect(QuizService.calculateProgress(state)).toBe(0);

    state = QuizService.goToNextStep(state);
    expect(QuizService.calculateProgress(state)).toBeCloseTo(50);

    state = QuizService.goToNextStep(state);
    expect(QuizService.calculateProgress(state)).toBe(100);
  });
});
