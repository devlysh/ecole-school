export interface Step {
  id: number;
  title?: string;
  text: string;
  image?: { url: string; width: number; height: number };
  answers?: string[];
}

export interface Answer {
  id: number;
  text: string | null;
}

export interface QuizState {
  currentStep: number;
  answers: Answer[];
}
