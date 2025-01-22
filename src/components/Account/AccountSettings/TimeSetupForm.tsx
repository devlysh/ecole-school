import React from "react";
import { useFormik } from "formik";
import { Select, Button, SelectItem } from "@nextui-org/react";
import logger from "@/lib/logger";

const TimeSetupForm: React.FC = () => {
  const formik = useFormik({
    initialValues: { timezone: "UTC", timeFormat: "24h" },
    onSubmit: (values) => {
      logger.debug({ values }, "DEBUG TIME SETUP");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Select
        name="timezone"
        label="Timezone"
        onChange={formik.handleChange}
        value={formik.values.timezone}
      >
        <SelectItem key="UTC" value="UTC">
          UTC
        </SelectItem>
      </Select>
      <Select
        name="timeFormat"
        label="Time Format"
        onChange={formik.handleChange}
        value={formik.values.timeFormat}
      >
        <SelectItem key="24h" value="24h">
          24h
        </SelectItem>
        <SelectItem key="12h" value="12h">
          12h
        </SelectItem>
      </Select>
      <Button type="submit">Save</Button>
    </form>
  );
};

export default TimeSetupForm;
