import { FormFieldType, FormStep, StepType } from "./types";

export const setPasswordStep = {
  name: "password",
  type: StepType.FORM,
  text: "Create your password",
  fields: [
    {
      name: "password",
      type: FormFieldType.PASSWORD,
      label: "Password",
      shouldValidate: true,
    },
    {
      name: "confirmPassword",
      type: FormFieldType.PASSWORD,
      label: "Confirm Password",
      shouldValidate: false,
    },
  ],
  footerText:
    "Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
} as FormStep;
