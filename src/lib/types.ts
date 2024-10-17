export enum StepType {
  INFO,
  QUESTION,
  FORM,
}

export enum FormFieldType {
  TEXT,
  EMAIL,
}

export interface Step {
  id: string;
  type: StepType;
  title?: string;
  text: string;
  image?: { url: string; width: number; height: number };
  footerText?: string;
}

export interface InfoStep extends Step {
  type: StepType.INFO;
}

export interface QuestionStep extends Step {
  type: StepType.QUESTION;
  allowCustomAnswer: boolean;
  answers: string[];
}

export interface FormStep extends Step {
  type: StepType.FORM;
  fields: FormFieldType[];
}

export type QuizStep = InfoStep | QuestionStep | FormStep;

export interface Answer {
  id: number;
  text: string;
  question: string;
}

export interface QuizState {
  currentStep: number;
  steps: QuizStep[];
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
  metadata: { discount?: number; credits: number };
}

export type PlansMap = Map<string, Plan[]>;
