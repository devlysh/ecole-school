import React from "react";
import { useFormik } from "formik";
import { Input, Button } from "@nextui-org/react";
import logger from "@/lib/logger";

interface NameAndEmailProps {
  name: string;
  email: string;
}

const NameAndEmailForm: React.FC<NameAndEmailProps> = ({
  name,
  email,
}: NameAndEmailProps) => {
  const formik = useFormik({
    initialValues: { name: name, email: email },
    onSubmit: (values) => {
      logger.debug({ values }, "DEBUG NAME AND EMAIL");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Input
        name="name"
        label="Name"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <Input
        name="email"
        label="Email"
        onChange={formik.handleChange}
        value={formik.values.email}
        isDisabled
      />
      <Button type="submit">Save</Button>
    </form>
  );
};

export default NameAndEmailForm;
