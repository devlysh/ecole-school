"use client";
import { useState, useMemo, useCallback } from "react";
import { steps } from "@/lib/quiz.model";
import QuizService from "@/lib/quiz.service";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { QuizState, QuizStep, StepType } from "@/lib/types";
import InfoStep from "./InfoStep";
import QuestionStep from "./QuestionStep";
import FormStep from "./FormStep";

const Quiz = () => {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>(
    QuizService.initializeQuiz(steps)
  );

  const currentStep = useMemo<QuizStep>(
    () => quizState.steps[quizState.currentStep],
    [quizState.currentStep, quizState.steps]
  );

  const isFirstStep = useMemo<boolean>(
    () => QuizService.isFirstStep(quizState),
    [quizState]
  );

  const isLastStep = useMemo<boolean>(
    () => quizState.currentStep === quizState.steps.length - 1,
    [quizState]
  );

  const percent = useMemo<number>(
    () => QuizService.calculateProgress(quizState),
    [quizState]
  );

  const handleAnswer = useCallback(
    (answer?: string) => {
      if (answer) {
        localStorage.setItem(currentStep.id, answer);
      }

      setQuizState((prevState) => {
        const nextState = QuizService.goToNextStep(
          answer ? QuizService.submitAnswer(prevState, answer) : prevState
        );
        return nextState;
      });

      if (isLastStep) {
        router.push("/pricing");
      }
    },
    [currentStep.id, isLastStep, router]
  );

  const handlePrevious = useCallback(() => {
    setQuizState((prevState) => QuizService.goToPreviousStep(prevState));
  }, []);

  const renderStep = () => {
    switch (currentStep.type) {
      case StepType.INFO:
        return <InfoStep step={currentStep} onNext={handleAnswer} />;
      case StepType.QUESTION:
        return <QuestionStep step={currentStep} onAnswer={handleAnswer} />;
      case StepType.FORM:
        return <FormStep step={currentStep} onSubmit={handleAnswer} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-12">
      <div className="w-1/2 text-center flex flex-col items-center">
        <Progress color="secondary" value={percent} className="mb-8" />
        {renderStep()}
        {!isFirstStep && (
          <Button
            size="sm"
            variant="light"
            onClick={handlePrevious}
            className="mt-4"
          >
            &lt; Back
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
