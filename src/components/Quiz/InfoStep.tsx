import Image from "next/image";
import { Button } from "@nextui-org/button";
import { InfoStep as InfoStepType } from "@/lib/types";

interface InfoStepProps {
  step: InfoStepType;
  onNext: () => void;
}

const InfoStep: React.FC<InfoStepProps> = ({ step, onNext }) => {
  return (
    <div>
      <div className="text-sm mb-8 text-secondary">{step.title}</div>
      <div className="text-3xl my-8">{step.text}</div>
      {step.image && (
        <div className="flex justify-center my-8">
          <Image
            src={`/${step.image.url}`}
            alt={step.text}
            aria-label={step.text}
            width={step.image.width}
            height={step.image.height}
            priority
          />
        </div>
      )}
      <Button
        className="mb-4"
        variant="solid"
        color="secondary"
        onClick={() => onNext()}
      >
        Got it &gt;
      </Button>
    </div>
  );
};

export default InfoStep;
