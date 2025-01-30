import React from "react";
import { useFormik } from "formik";
import { Input, Button } from "@nextui-org/react";
import { toast } from "react-toastify";

interface PasswordChangeFormProps {
  setPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  setPassword,
}) => {
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      if (values.newPassword === values.confirmPassword) {
        await setPassword(values.currentPassword, values.newPassword);
      } else {
        toast.error("New password and confirm password are not the same");
      }
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
