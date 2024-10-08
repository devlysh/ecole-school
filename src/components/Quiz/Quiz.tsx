"use client";
import { useState } from "react";
import { questions } from "@/lib/quiz.model";
import QuizService from "@/lib/quiz.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Progress } from "@nextui-org/progress";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";

const Quiz = () => {
  const router = useRouter();
  const [quizState, setQuizState] = useState(
    QuizService.initializeQuiz(questions)
  );

  const currentStep = quizState.currentStep;
  const currentQuestion = questions[quizState.currentStep];
  const firstStep = currentStep === 0;
  const lastStep = currentStep === questions.length - 1;
  const percent = (currentStep / (questions.length - 1)) * 100;

  const handleNext = () => {
    if (lastStep) {
      router.push("/");
    }

    setQuizState(QuizService.goToNextStep(quizState));
  };

  const handlePrevious = () =>
    setQuizState(QuizService.goToPreviousStep(quizState));

  const handleAnswer = (answer: string) => {
    setQuizState(QuizService.submitAnswer(quizState, answer));
    setQuizState(QuizService.goToNextStep(quizState));
  };

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
          {questions[currentStep].title}
        </div>
        <div className="text-3xl mb-8">{questions[currentStep].text}</div>
        {currentQuestion.image && (
          <Image
            src={`/${currentQuestion.image.url}`}
            alt={currentQuestion.text}
            width={currentQuestion.image.width}
            height={currentQuestion.image.height}
          />
        )}
        {currentQuestion.answers &&
          currentQuestion.answers.map((answer, i) => (
            <Card key={answer} className="m-4 w-full">
              <div
                className="cursor-pointer p-4"
                onClick={() => handleAnswer(`${i + 1}`)}
              >
                {answer}
              </div>
            </Card>
          ))}
        <div className="mt-8">
          {!currentQuestion.answers && (
            <div>
              <Button className="mb-4" variant="solid" color="secondary" onClick={handleNext}>
                Got it &gt;
              </Button>
            </div>
          )}
          {!firstStep && (
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
