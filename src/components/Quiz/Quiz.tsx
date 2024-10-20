"use client";
import { useState, useMemo, useCallback } from "react";
import { steps } from "@/lib/quiz.model";
import QuizService, { pipe } from "@/lib/quiz.service";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { QuizState, QuizStep, StepType } from "@/lib/types";
import InfoStep from "./Steps/InfoStep";
import QuestionStep from "./Steps/QuestionStep";
import FormStep from "./Steps/FormStep";
import logger from "@/lib/logger";
import Cookies from "js-cookie";
import { checkEmail } from "@/app/api/v1/check-email/request";
import { preRegisterUserRequest } from "@/app/api/v1/pre-register-user/request";

const Quiz = () => {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>(
    QuizService.initializeQuiz(steps)
  );
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const preRegisterUserAndNavigateToPricing = useCallback(async () => {
    try {
      await preRegisterUserRequest();

      router.push("/pricing");
    } catch (err) {
      logger.error(err, "Error registering user");
    }
  }, [router]);

  const handleNext = useCallback(
    async (answer?: string) => {
      if (currentStep.name === "email" && answer) {
        try {
          const { isTaken } = await checkEmail(answer);

          if (isTaken) {
            setEmailError("Email is already taken");
            return;
          }
        } catch (error) {
          logger.error({ error }, "Error during check if email is taken");
          if (error instanceof Error) {
            setEmailError(error.message);
          } else if (typeof error === "string") {
            setEmailError(error);
          } else {
            setEmailError("Failed to check if email is taken");
          }
          return;
        }
      }

      setQuizState((prevState) => {
        if (!answer) {
          return QuizService.goToNextStep(prevState);
        }

        Cookies.set(currentStep.name, answer, { path: "/" });
        return pipe(prevState)(
          (state: QuizState) => QuizService.submitAnswer(state, answer),
          QuizService.goToNextStep,
          (state: QuizState) => {
            logger.debug({ answer, state }, "Moving to next step");
            if (isLastStep) {
              logger.debug(
                { state },
                "Last step, name and email is set, moving to pricing"
              );
            }
            return state;
          }
        );
      });

      if (isLastStep) {
        preRegisterUserAndNavigateToPricing();
      }
    },
    [currentStep, isLastStep, preRegisterUserAndNavigateToPricing]
  );

  const handlePrevious = useCallback(() => {
    setQuizState((prevState) => {
      const state = QuizService.goToPreviousStep(prevState);
      logger.debug({ state }, "Moving to previous step");
      return state;
    });
  }, []);

  const renderStep = useCallback(() => {
    switch (currentStep.type) {
      case StepType.INFO:
        return <InfoStep step={currentStep} onNext={handleNext} />;
      case StepType.QUESTION:
        return <QuestionStep step={currentStep} onNext={handleNext} />;
      case StepType.FORM:
        return (
          <FormStep
            error={emailError}
            step={currentStep}
            onNext={(values) => handleNext(values[currentStep.name])}
          />
        );
      default:
        return null;
    }
  }, [currentStep, emailError, handleNext]);

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
