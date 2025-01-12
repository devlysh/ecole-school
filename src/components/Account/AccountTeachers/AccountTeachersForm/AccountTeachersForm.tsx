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
import { TeacherFormValues } from "@/lib/types";
import { updateTeacher } from "@/app/api/v1/teachers/update/request";
import { Vacation } from "@prisma/client";

interface AccountTeachersFormProps {
  name?: string;
  email?: string;
  timezone?: string;
  timeSlots?: EventInput[];
  vacations?: EventInput[];
}

const AccountTeachersForm: FC<AccountTeachersFormProps> = ({
  name,
  email,
  timezone,
  timeSlots: initialTimeSlots,
  vacations: initialVacations,
}) => {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<EventInput[]>(
    shapeTimeSlots(initialTimeSlots ?? [])
  );
  const [vacations, setVacations] = useState<EventInput[]>(
    initialVacations ?? []
  );
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (values: TeacherFormValues) => {
      try {
        const { isTaken } = await checkEmailRequest(values.email);
        const teacher: TeacherFormValues & {
          timeSlots: EventInput[];
          vacations: EventInput[];
        } = {
          name: values.name,
          email: values.email,
          password: values.password,
          timezone: values.timezone,
          timeSlots,
          vacations: vacations.map((vacation) => ({
            start: new Date(vacation.start as string).toISOString(),
          })),
        };

        logger.debug({ timeSlots, vacations }, "DEBUG: timeSlots, vacations");

        if (isTaken) {
          const result = await updateTeacher(teacher);
          // TODO: Make this a toast
          logger.info({ result, teacher }, "Teacher updated successfully");
        } else {
          const result = await addTeacher(teacher);
          // TODO: Make this a toast
          logger.info({ result, teacher }, "Teacher added successfully");
        }

        router.push("/account/teachers");
      } catch (error) {
        console.error("Error adding/updating teacher:", error);
      }
    },
    [router, timeSlots, vacations]
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
          <ScheduleCalendar
            email={email ?? ""}
            timeSlots={timeSlots}
            vacations={vacations}
            setTimeSlots={setTimeSlots}
            setVacations={setVacations}
          />
        </div>
        <div className="w-full p-2">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};

export default AccountTeachersForm;

const shapeTimeSlots = (timeSlots: EventInput[]) => {
  return timeSlots.map((slot, index) => {
    const start = new Date(slot.start as Date);
    const end = new Date(slot.end as Date);
    const duration = {
      hours: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    };

    return {
      ...slot,
      id: index.toString(),
      title: slot.rrule ? "Recurring Event" : "Single Event",
      start: start.toISOString(),
      end: end.toISOString(),
      color: "grey",
      duration,
    };
  });
};
