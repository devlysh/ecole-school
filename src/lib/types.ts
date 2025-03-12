import { EventInput } from "@fullcalendar/core/index.js";
import { BookedClass, Language } from "@prisma/client";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum TokenType {
  URL_TOKEN = "token",
  ACCESS = "accessToken",
  REGISTRATION = "registrationToken",
  PRE_AUTH = "preAuthToken",
}

export enum RoleName {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

export enum LanguageCode {
  EN = "en",
  ES = "es",
  FR = "fr",
  DE = "de",
  IT = "it",
}

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

export interface AccessTokenPayload {
  exp?: number;
  iat?: number;
  email: string;
  name: string;
  roles: string[];
}

export interface RegistrationTokenPayload {
  exp?: number;
  iat?: number;
  email: string;
}

export interface PreAuthTokenPayload {
  exp?: number;
  iat?: number;
  token?: string;
  registrationToken?: string;
  name: string;
  email: string;
  currency?: string;
  language?: string;
  selectedPrice?: string;
  subscriptionId?: string;
  quizAnswers?: Record<string, string>;
}

export type TokenPayload =
  | AccessTokenPayload
  | PreAuthTokenPayload
  | RegistrationTokenPayload;

export interface Teacher extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  roles: { name: string }[];
  avatar?: string;
  languages?: Language[];
}

export interface TeacherFormValues {
  name: string;
  email: string;
  password: string;
  timezone: string;
  languages: Language[];
}

export type AddUpdateTeacherRequest = TeacherFormValues & {
  timeSlots: EventInput[];
  vacations: EventInput[];
};

export interface SettingsFormValues {
  name: string;
  email: string;
  timezone: string;
}

export interface AvailableCalendarSlot {
  day: number;
  hour: number;
}

export interface Settings {
  name: string;
  email: string;
  languages: string[];
  quizAnswers: Record<string, string>;
  // timezone: string;
  // timeFormat: string;
}

export type DisplayBookedClass = Pick<
  BookedClass,
  "id" | "date" | "recurring" | "createdAt"
>;

export type TeacherClass = Pick<BookedClass, "id" | "date" | "recurring"> & {
  studentName: string;
};
