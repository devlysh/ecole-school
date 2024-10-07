"use client";
import { useState } from "react";
import { questions } from "@/lib/quiz.model";
import QuizService from "@/lib/quiz.service";
import Image from "next/image";
import { Button, Card } from "@mui/material";
import { useRouter } from "next/navigation";

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
    <div>
      <div>Progress: {percent}%</div>
      <div>{questions[currentStep].text}</div>
      <div>
        {currentQuestion.image && (
          <Image
            src={`/${currentQuestion.image.url}`}
            alt={currentQuestion.text}
            width={currentQuestion.image.width}
            height={currentQuestion.image.height}
          />
        )}
      </div>
      {currentQuestion.answers &&
        currentQuestion.answers.map((answer, i) => (
          <div className="p-4" key={answer}>
            <Card
              className="cursor-pointer"
              onClick={() => handleAnswer(`${i + 1}`)}
            >
              {answer}
            </Card>
          </div>
        ))}
      {!currentQuestion.answers && (
        <div>
          <Button variant="contained" onClick={handleNext}>
            Got it &gt;
          </Button>
        </div>
      )}
      {!firstStep && (
        <div>
          <Button size="small" onClick={handlePrevious}>
            &lt; Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
