import { Card } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import { QuestionStep as QuestionStepType } from "@/lib/types";
import Cookies from "js-cookie";

interface QuestionStepProps {
  step: QuestionStepType;
  onNext: (answer: string) => void;
}

const QuestionStep: React.FC<QuestionStepProps> = ({ step, onNext }) => {
  const [customAnswer, setCustomAnswer] = useState("");

  const handleCustomAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomAnswer(event.target.value);
  };

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      onNext(customAnswer.trim());
      setCustomAnswer("");
    }
  };

  useEffect(() => {
    const answer = Cookies.get(step.id);

    if (answer) {
      setCustomAnswer(answer);
    }
  }, [step.id]);

  return (
    <div>
      <div className="text-3xl mb-8">{step.text}</div>
      {step.answers.map((answer) => (
        <Card key={answer} className="w-full my-4">
          <div className="cursor-pointer p-4" onClick={() => onNext(answer)}>
            {answer}
          </div>
        </Card>
      ))}
      {step.allowCustomAnswer && (
        <Card className="w-full my-4 p-4">
          <Input
            type="text"
            placeholder="Enter your answer"
            value={customAnswer}
            onChange={handleCustomAnswerChange}
            className="w-full mb-4"
          />
          <Button
            color="secondary"
            onClick={handleCustomAnswerSubmit}
            disabled={!customAnswer.trim()}
          >
            Submit
          </Button>
        </Card>
      )}
    </div>
  );
};

export default QuestionStep;
