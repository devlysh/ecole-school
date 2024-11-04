"use client";

import React, { useState, FC } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import logger from "@/lib/logger";
import { EventInput } from "@fullcalendar/core";
import { useFormik } from "formik";
import AccountTeachersAddCalendar from "./AccountTeachersAddCalendar";

interface TeacherFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
}

const AccountTeachersAdd: FC = () => {
  const [timeSlots, setTimeSlots] = useState<EventInput[]>([]);

  const handleSubmit = (values: TeacherFormValues) => {
    logger.debug({ ...values, timeSlots }, "Form Submission");
  };

  const formik = useFormik<TeacherFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      timezone: "utc",
    },
    onSubmit: handleSubmit,
  });

  return (
    <div className="flex w-full">
      <div className="w-full">
        <h1>Add New Teacher</h1>
        <div className="flex flex-row flex-wrap w-full">
          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="w-1/2 p-2">
              <Input
                name="firstName"
                label="First Name"
                className="w-full"
                onChange={formik.handleChange}
                value={formik.values.firstName}
                required
              />
            </div>
            <div className="w-1/2 p-2">
              <Input
                name="lastName"
                label="Last Name"
                className="w-full"
                onChange={formik.handleChange}
                value={formik.values.lastName}
                required
              />
            </div>
            <div className="w-1/2 p-2">
              <Input
                name="email"
                label="Email"
                className="w-full"
                onChange={formik.handleChange}
                value={formik.values.email}
                required
              />
            </div>
            <div className="w-1/2 p-2">
              <Input
                name="password"
                label="Password"
                type="password"
                className="w-full"
                onChange={formik.handleChange}
                value={formik.values.password}
                required
              />
            </div>
            <div className="w-full p-2">
              <Select
                placeholder="Select Timezone"
                value={formik.values.timezone}
                onChange={formik.handleChange}
                label="Timezone"
                required
                isDisabled
                defaultSelectedKeys={[formik.values.timezone]}
              >
                <SelectItem key="utc">UTC</SelectItem>
              </Select>
            </div>
            <AccountTeachersAddCalendar
              timeSlots={timeSlots}
              setTimeSlots={setTimeSlots}
            />
            <div className="w-full p-2">
              <Button type="submit">Add Teacher</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountTeachersAdd;
