export interface Step {
  id: number;
  title?: string;
  text: string;
  image?: { url: string; width: number; height: number };
  answers?: string[];
}

export interface Answer {
  id: number;
  text: string;
  question: string;
}

export interface QuizState {
  currentStep: number;
  steps: Step[];
  answers: Answer[];
}
