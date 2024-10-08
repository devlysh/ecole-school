import { Step } from "./types";

export const steps: Step[] = [
  {
    id: 1,
    title: "Perfect Teacher Match",
    text: "We match you with a native - level teacher to fit your goals and schedule",
    image: { url: "hands-puzzle.png", width: 217, height: 265 },
  },
  {
    id: 2,
    text: "What is your current level?",
    answers: [
      "From scratch (no prior knowledge)",
      "Beginner",
      "Intermediate",
      "Advanced",
    ],
  },
  {
    id: 3,
    title: "Any Level Welcome",
    text: "From beginners to advanced learners, we provide the tailored support you need to succeed",
    image: {
      url: "learning-monitor.png",
      width: 278,
      height: 207,
    },
  },
  {
    id: 4,
    text: "What motivates you to learn this language?",
    answers: [
      "I want to travel and communicate with locals",
      "I need it for my job or career growth",
      "I live in a country where the language is spoken",
      "I’m learning it for personal development and fun",
      "Other",
    ],
  },
  {
    id: 5,
    title: "Adaptable Class Times",
    text: "You can reschedule or cancel classes to fit your busy life",
    image: {
      url: "calendar.png",
      width: 233.89,
      height: 194,
    },
  },
  {
    id: 6,
    text: "Which areas do you want to focus on the most?",
    answers: [
      "Speaking",
      "Listening",
      "Reading",
      "Writing",
      "Grammar and structure",
      "All of the above",
    ],
  },
  {
    id: 7,
    title: "Your Goals First",
    text: "Our program adapts to your goals — learn what matters most, from work vocabulary to conversation!",
    image: {
      url: "notebook.png",
      width: 180,
      height: 180,
    },
  },
  {
    id: 8,
    text: "How much time do you want to study each week?",
    answers: [
      "1 hour",
      "2-3 hours",
      "4-5 hours",
      "5+ hours",
      "I don’t know yet",
    ],
  },
  {
    id: 9,
    title: "Flexible Subscription",
    text: "Change or cancel your subscription anytime — your plan, your control",
    image: {
      url: "handshake.png",
      width: 180,
      height: 180,
    },
  },
];
