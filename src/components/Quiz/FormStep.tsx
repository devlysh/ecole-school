import { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FormStep as FormStepType, FormFieldType } from "@/lib/types";

interface FormStepProps {
  step: FormStepType;
  onSubmit: (answer: string) => void;
}

const FormStep: React.FC<FormStepProps> = ({ step, onSubmit }) => {
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    const initialValues: { [key: string]: string } = {};
    step.fields.forEach(() => {
      const storedValue = localStorage.getItem(step.id);
      if (storedValue) initialValues[step.id] = storedValue;
    });
    setValues(initialValues);
  }, [step.fields, step.id]);

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
    if (answer && (step.fields.includes(FormFieldType.TEXT) || isEmailValid)) {
      localStorage.setItem(step.id, answer);
      onSubmit(answer);
    }
  };

  return (
    <div className="w-full">
      <div className="text-3xl mb-8">{step.text}</div>
      {step.fields.map((field, index) => (
        <Input
          key={index}
          type={field === FormFieldType.EMAIL ? "email" : "text"}
          placeholder={
            field === FormFieldType.EMAIL
              ? "Enter your email"
              : "Enter your response"
          }
          value={values[step.id] || ""}
          onChange={(e) => handleChange(e, field)}
          className="w-full mb-4"
          color={
            field === FormFieldType.EMAIL && !isEmailValid
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
          (step.fields.includes(FormFieldType.EMAIL) && !isEmailValid)
        }
      >
        Submit
      </Button>
      {step.footerText && <div className="text-xs mt-8">{step.footerText}</div>}
    </div>
  );
};

export default FormStep;
