"use client";
import { useState, useMemo, useCallback } from "react";
import { steps } from "@/lib/quiz.model";
import QuizService, { pipe } from "@/lib/quiz.service";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { QuizState, QuizStep, StepType } from "@/lib/types";
import InfoStep from "./InfoStep";
import QuestionStep from "./QuestionStep";
import FormStep from "./FormStep";
import logger from "@/lib/logger";
import Cookies from "js-cookie";

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

  const handleNext = useCallback(
    (answer?: string) => {
      setQuizState((prevState) => {
        let state;
        if (answer) {
          Cookies.set(currentStep.id, answer, { path: "/" });
          state = pipe(prevState)(
            (state: QuizState) => QuizService.submitAnswer(state, answer),
            (state: QuizState) => QuizService.goToNextStep(state)
          );
        } else {
          state = QuizService.goToNextStep(prevState);
        }
        logger.debug({ answer, state }, "Moving to next step");

        if (isLastStep) {
          logger.debug(
            { state },
            "Last step, name and email is set , moving to pricing"
          );
        }

        return state;
      });

      if (isLastStep) {
        router.push("/pricing");
      }
    },
    [currentStep.id, isLastStep, router]
  );

  const handlePrevious = useCallback(() => {
    logger.debug({ quizState }, "Moving to previous step");
    setQuizState((prevState) => {
      const state = QuizService.goToPreviousStep(prevState);
      logger.debug({ state }, "Moving to next step");
      return state;
    });
  }, [quizState]);

  const renderStep = useCallback(() => {
    switch (currentStep.type) {
      case StepType.INFO:
        return <InfoStep step={currentStep} onNext={handleNext} />;
      case StepType.QUESTION:
        return <QuestionStep step={currentStep} onNext={handleNext} />;
      case StepType.FORM:
        return <FormStep step={currentStep} onNext={handleNext} />;
      default:
        return null;
    }
  }, [currentStep, handleNext]);

  return (
    <div className="flex flex-col justify-center items-center mt-12">
      <div className="w-1/2 text-center flex flex-col items-center">
        <Progress
          color="secondary"
          value={percent}
          className="mb-8"
          aria-label="Quiz steps"
        />
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
