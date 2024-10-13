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

export interface Language {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  product: string;
  amount: number;
  currency: string;
  metadata: { discount?: number; numberOfClasses: number };
}

export type PlansMap = Map<string, Plan[]>;
