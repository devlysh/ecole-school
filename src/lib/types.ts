import { JwtPayload } from "jsonwebtoken";

export enum StepType {
  INFO,
  QUESTION,
  FORM,
}

export enum FormFieldType {
  TEXT,
  EMAIL,
  PASSWORD,
}

export interface Step {
  name: string;
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
  fields: FormField[];
}

export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  shouldValidate?: boolean;
}

export type QuizStep = InfoStep | QuestionStep | FormStep;

export interface Answer {
  id: string;
  text: string;
  question: string;
}

export interface QuizState {
  currentStep: number;
  steps: QuizStep[];
  answers: (Answer | null)[];
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

export interface CookiesPayload extends JwtPayload {
  name: string;
  email: string;
  currency?: string;
  language?: string;
  priceId?: string;
  selectedPrice?: string;
}
