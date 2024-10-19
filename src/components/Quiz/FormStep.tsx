import { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FormStep as FormStepType, FormFieldType } from "@/lib/types";
import Cookies from "js-cookie";

interface FormStepProps {
  step: FormStepType;
  onNext: (answer: string) => void;
}

const FormStep: React.FC<FormStepProps> = ({ step, onNext }) => {
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    const value = Cookies.get(step.id);
    if (value) {
      setValues((prevValues) => ({ ...prevValues, [step.id]: value }));
    }
  }, [step.id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldType: FormFieldType
  ) => {
    const value = event.target.value;
    setValues((prevValues) => ({ ...prevValues, [step.id]: value }));

    if (fieldType === FormFieldType.EMAIL) {
      setIsEmailValid(validateEmail(value));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    const answer = values[step.id]?.trim();
    onNext(answer);
  };

  return (
    <div className="w-full">
      <div className="text-3xl mb-8">{step.text}</div>
      {step.fields.map((field, index) => (
        <Input
          key={index}
          type={field.type === FormFieldType.EMAIL ? "email" : "text"}
          placeholder={field.label}
          value={values[step.id] || ""}
          onChange={(e) => handleChange(e, field.type)}
          className="w-full mb-4"
          color={
            field.type === FormFieldType.EMAIL && !isEmailValid
              ? "danger"
              : "default"
          }
        />
      ))}
      {!isEmailValid && (
        <div className="text-red-500 text-xs mb-4">
          Please enter a valid email address.
        </div>
      )}
      <Button
        className="w-full"
        variant="solid"
        color="secondary"
        onClick={handleSubmit}
        isDisabled={
          !values[step.id]?.trim() ||
          step.fields.some(
            (field) => field.type === FormFieldType.EMAIL && !isEmailValid
          )
        }
      >
        Submit
      </Button>
      {step.footerText && <div className="text-xs mt-8">{step.footerText}</div>}
    </div>
  );
};

export default FormStep;
