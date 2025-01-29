import React from "react";
import { useFormik } from "formik";
import { Input, Button } from "@nextui-org/react";
import logger from "@/lib/logger";

const PasswordChangeForm: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      logger.debug({ values }, "DEBUG PASSWORD CHANGE");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-4">
        <Input
          name="currentPassword"
          label="Current Password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.currentPassword}
        />
        <Input
          name="newPassword"
          label="New Password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.newPassword}
        />
        <Input
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
};

export default PasswordChangeForm;
