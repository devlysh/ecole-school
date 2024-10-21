import { FormFieldType, QuizStep, StepType } from "./types";

export const steps: QuizStep[] = [
  // {
  //   name: "info-1",
  //   type: StepType.INFO,
  //   title: "Perfect Teacher Match",
  //   text: "We match you with a native - level teacher to fit your goals and schedule",
  //   image: { url: "hands-puzzle.png", width: 217, height: 265 },
  // },
  // {
  //   name: "currentLevel",
  //   type: StepType.QUESTION,
  //   allowCustomAnswer: false,
  //   text: "What is your current level?",
  //   answers: [
  //     "From scratch (no prior knowledge)",
  //     "Beginner",
  //     "Intermediate",
  //     "Advanced",
  //   ],
  // },
  // {
  //   name: "info-2",
  //   type: StepType.INFO,
  //   title: "Any Level Welcome",
  //   text: "From beginners to advanced learners, we provide the tailored support you need to succeed",
  //   image: {
  //     url: "learning-monitor.png",
  //     width: 278,
  //     height: 207,
  //   },
  // },
  // {
  //   name: "motivatesYou",
  //   type: StepType.QUESTION,
  //   allowCustomAnswer: true,
  //   text: "What motivates you to learn this language?",
  //   answers: [
  //     "I want to travel and communicate with locals",
  //     "I need it for my job or career growth",
  //     "I live in a country where the language is spoken",
  //     "I’m learning it for personal development and fun",
  //   ],
  // },
  // {
  //   name: "info-3",
  //   type: StepType.INFO,
  //   title: "Adaptable Class Times",
  //   text: "You can reschedule or cancel classes to fit your busy life",
  //   image: {
  //     url: "calendar.png",
  //     width: 233.89,
  //     height: 194,
  //   },
  // },
  // {
  //   name: "areasToFocus",
  //   type: StepType.QUESTION,
  //   allowCustomAnswer: false,
  //   text: "Which areas do you want to focus on the most?",
  //   answers: [
  //     "Speaking",
  //     "Listening",
  //     "Reading",
  //     "Writing",
  //     "Grammar and structure",
  //     "All of the above",
  //   ],
  // },
  // {
  //   name: "info-4",
  //   type: StepType.INFO,
  //   title: "Your Goals First",
  //   text: "Our program adapts to your goals — learn what matters most, from work vocabulary to conversation!",
  //   image: {
  //     url: "notebook.png",
  //     width: 180,
  //     height: 180,
  //   },
  // },
  // {
  //   name: "studyTimePerWeek",
  //   type: StepType.QUESTION,
  //   allowCustomAnswer: false,
  //   text: "How much time do you want to study each week?",
  //   answers: [
  //     "1 hour",
  //     "2-3 hours",
  //     "4-5 hours",
  //     "5+ hours",
  //     "I don’t know yet",
  //   ],
  // },
  // {
  //   name: "into-5",
  //   type: StepType.INFO,
  //   title: "Flexible Subscription",
  //   text: "Change or cancel your subscription anytime — your plan, your control",
  //   image: {
  //     url: "handshake.png",
  //     width: 180,
  //     height: 180,
  //   },
  // },
  {
    name: "name",
    type: StepType.FORM,
    text: "What is your name?",
    fields: [
      {
        name: "name",
        type: FormFieldType.TEXT,
        label: "Name",
      },
    ],
  },
  {
    name: "email",
    type: StepType.FORM,
    text: "What is your email?",
    fields: [
      {
        name: "email",
        type: FormFieldType.EMAIL,
        label: "Email",
      },
    ],
    footerText:
      "By providing your email, you acknowledge that you are at least 18 years old and agree to EcoleFamily's Terms and Conditions and Privacy Policy. You also consent to receive emails and updates regarding our services. You can unsubscribe at any time.",
  },
];
