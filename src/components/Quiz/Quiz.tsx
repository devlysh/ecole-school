"use client";
import { useState, useCallback } from "react";
import { steps } from "@domain/models/Quiz.model";
import { QuizService } from "@domain/services/Quiz.service";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { QuizState, StepType } from "@/lib/types";
import InfoStep from "./Steps/InfoStep";
import QuestionStep from "./Steps/QuestionStep";
import FormStep from "./Steps/FormStep";
import logger from "@/lib/logger";
import Cookies from "js-cookie";
import { checkEmailRequest } from "@/app/api/v1/email/[email]/request";
import { submitQuizRequest } from "@/app/api/v1/quiz/request";
import { toast } from "react-toastify";

const Quiz = () => {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>(
    QuizService.initializeQuiz(steps)
  );
  const [emailError, setEmailError] = useState<string | null>(null);

  const currentStep = quizState.steps[quizState.currentStep];
  const isFirstStep = quizState.currentStep === 0;
  const isLastStep = quizState.currentStep === quizState.steps.length - 1;
  const percent = QuizService.calculateProgress(quizState);

  const preRegisterUserAndNavigateToPricing = useCallback(async () => {
    try {
      await submitQuizRequest();
      router.push("/pricing");
    } catch (err: unknown) {
      toast.error("Failed to register user");
      logger.error(err, "Error registering user");
    }
  }, [router]);

  const handleEmailValidation = useCallback(async (email: string) => {
    try {
      const { isTaken } = await checkEmailRequest(email);
      if (isTaken) {
        setEmailError("Email is already taken");
        return false;
      }
    } catch (err: unknown) {
      logger.error(err, "Error during email validation");
      if (err instanceof Error) {
        setEmailError(err.message);
      } else if (typeof err === "string") {
        setEmailError(err);
      } else {
        setEmailError("Failed to check if email is taken");
      }
      return false;
    }
    return true;
  }, []);

  const handleNext = useCallback(
    async (answer?: string) => {
      if (currentStep.name === "email" && answer) {
        const valid = await handleEmailValidation(answer);
        if (!valid) return;
      }

      if (emailError) setEmailError(null);

      setQuizState((prevState) => {
        if (!answer) {
          return QuizService.goToNextStep(prevState);
        }

        Cookies.set(currentStep.name, answer, { path: "/" });
        const updatedState = QuizService.submitAnswer(prevState, answer);
        return QuizService.goToNextStep(updatedState);
      });

      if (isLastStep) {
        await preRegisterUserAndNavigateToPricing();
      }
    },
    [
      currentStep,
      isLastStep,
      emailError,
      handleEmailValidation,
      preRegisterUserAndNavigateToPricing,
    ]
  );

  const handlePrevious = useCallback(() => {
    setQuizState((prevState) => QuizService.goToPreviousStep(prevState));
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
