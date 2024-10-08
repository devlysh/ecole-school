"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { steps } from "@/lib/quiz.model";
import QuizService from "@/lib/quiz.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { QuizState, Step } from "@/lib/types";

const Quiz = () => {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>(
    QuizService.initializeQuiz(steps)
  );

  const currentQuestion = useMemo<Step>(
    () => steps[quizState.currentStep],
    [quizState.currentStep]
  );

  const isFirstStep = useMemo<boolean>(
    () => QuizService.isFirstStep(quizState),
    [quizState]
  );

  const isQuizComplete = useMemo<boolean>(
    () => QuizService.isQuizComplete(quizState),
    [quizState]
  );

  const percent = useMemo<number>(
    () => QuizService.calculateProgress(quizState),
    [quizState]
  );

  const handleNext = useCallback(() => {
    setQuizState((prevState) => {
      let state: QuizState;
      state = QuizService.submitAnswer(prevState, "Ok");
      state = QuizService.goToNextStep(state);
      return state;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setQuizState((prevState) => QuizService.goToPreviousStep(prevState));
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    setQuizState((prevState) => {
      let state: QuizState;
      state = QuizService.submitAnswer(prevState, answer);
      state = QuizService.goToNextStep(state);
      return state;
    });
  }, []);

  useEffect(() => {
    if (isQuizComplete) {
      router.push("/");
      console.log(quizState);
      localStorage.setItem(
        "quizAnswers",
        JSON.stringify(quizState.answers.filter((_, i) => steps[i].answers))
      );
    }
  }, [quizState, isQuizComplete, router]);

  return (
    <div className="flex flex-col justify-center items-center mt-12">
      <div className="w-1/2 text-center flex flex-col items-center">
        <Progress
          color="secondary"
          aria-label="Loading..."
          value={percent}
          className="mb-8"
        />
        <div className="text-sm mb-8 text-secondary">
          {currentQuestion.title}
        </div>
        <div className="text-3xl mb-8">{currentQuestion.text}</div>
        {currentQuestion.image && (
          <Image
            src={`/${currentQuestion.image.url}`}
            alt={currentQuestion.text}
            width={currentQuestion.image.width}
            height={currentQuestion.image.height}
            priority
          />
        )}
        {currentQuestion.answers &&
          currentQuestion.answers.map((answer) => (
            <Card key={answer} className="m-4 w-full">
              <div
                className="cursor-pointer p-4"
                onClick={() => handleAnswer(answer)}
              >
                {answer}
              </div>
            </Card>
          ))}
        <div className="mt-8">
          {!currentQuestion.answers && (
            <div>
              <Button
                className="mb-4"
                variant="solid"
                color="secondary"
                onClick={handleNext}
              >
                Got it &gt;
              </Button>
            </div>
          )}
          {!isFirstStep && (
            <div>
              <Button size="sm" variant="light" onClick={handlePrevious}>
                &lt; Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
