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
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 mb-8">
      <div className="flex flex-row gap-4">
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
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
};

export default NameAndEmailForm;
