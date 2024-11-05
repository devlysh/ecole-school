"use client";

import React, { useState, FC, useRef, useCallback } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import logger from "@/lib/logger";
import { EventInput } from "@fullcalendar/core";
import { useFormik } from "formik";
import ScheduleCalendar from "./ScheduleCalendar";
import { addTeacher } from "@/app/api/v1/teachers/add/request";
import { useRouter } from "next/navigation";
import { checkEmailRequest } from "@/app/api/v1/email/check/request";
import { TeacherFormValues, TeacherFormWithTimeSlots } from "@/lib/types";
import { updateTeacher } from "@/app/api/v1/teachers/update/request";

interface AccountTeachersFormProps {
  name?: string;
  email?: string;
  timezone?: string;
  timeSlots?: EventInput[];
}

const AccountTeachersForm: FC<AccountTeachersFormProps> = ({
  name,
  email,
  timezone,
  timeSlots: initialTimeSlots,
}) => {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<EventInput[]>(
    initialTimeSlots ?? []
  );
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (values: TeacherFormValues) => {
      try {
        const { isTaken } = await checkEmailRequest(values.email);
        const teacher: TeacherFormWithTimeSlots = {
          name: values.name,
          email: values.email,
          password: values.password,
          timezone: values.timezone,
          timeSlots,
        };

        if (isTaken) {
          const result = await updateTeacher(teacher);
          logger.debug({ result }, "Teacher updated successfully");
        } else {
          const result = await addTeacher(teacher);
          logger.debug({ result }, "Teacher added successfully");
        }

        router.push("/account/teachers");
      } catch (error) {
        console.error("Error adding/updating teacher:", error);
      }
    },
    [router, timeSlots]
  );

  const formik = useFormik<TeacherFormValues>({
    initialValues: {
      name: name ?? "",
      email: email ?? "",
      password: email ? "********" : "",
      timezone: timezone ?? "utc",
    },
    onSubmit: handleSubmit,
  });

  return (
    <div className="w-full">
      <form onSubmit={formik.handleSubmit} className="flex flex-wrap w-full">
        <div className="w-1/2 p-2">
          <Input
            name="name"
            label="Name"
            className="w-full"
            onChange={formik.handleChange}
            value={formik.values.name}
            required
          />
        </div>
        <div className="w-1/2 p-2">
          <Input
            ref={emailInputRef}
            name="email"
            label="Email"
            className="w-full"
            onChange={formik.handleChange}
            value={formik.values.email}
            required
            isDisabled={!!email}
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
            required={!email}
          />
        </div>
        <div className="w-1/2 p-2">
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
        <div className="w-full mt-4">
          <ScheduleCalendar timeSlots={timeSlots} setTimeSlots={setTimeSlots} />
        </div>
        <div className="w-full p-2">
          <Button type="submit">Add Teacher</Button>
        </div>
      </form>
    </div>
  );
};

export default AccountTeachersForm;
