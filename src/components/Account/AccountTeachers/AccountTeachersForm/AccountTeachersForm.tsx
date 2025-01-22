"use client";

import React, { useState, FC, useRef, useCallback, useEffect } from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import logger from "@/lib/logger";
import { EventInput } from "@fullcalendar/core";
import { useFormik } from "formik";
import ScheduleCalendar from "./ScheduleCalendar";
import { addTeacher } from "@/app/api/v1/teachers/add/request";
import { useRouter } from "next/navigation";
import { checkEmailRequest } from "@/app/api/v1/email/check/request";
import { TeacherFormValues } from "@/lib/types";
import { updateTeacher } from "@/app/api/v1/teachers/update/[email]/request";
import { fetchTeacherByEmail } from "@/app/api/v1/teachers/[email]/request";
import { AvailableSlot, Teacher, User, Vacation } from "@prisma/client";
import { convertToRruleDate } from "@/lib/utils";

interface AccountTeachersFormProps {
  email?: string;
}

const AccountTeachersForm: FC<AccountTeachersFormProps> = ({ email }) => {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<EventInput[]>([]);
  const [vacations, setVacations] = useState<EventInput[]>([]);
  const [name, setName] = useState<string>("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!email) return;

      const user: User & {
        teacher: Teacher & {
          availableSlots: AvailableSlot[];
          vacations: Vacation[];
        };
      } = await fetchTeacherByEmail(email);

      if (!user || !user.name || !user.teacher) return;

      setName(user.name);

      setTimeSlots(
        shapeTimeSlots(
          user.teacher.availableSlots.map((slot: AvailableSlot) => ({
            start: slot.startTime,
            end: slot.endTime,
            rrule: slot.rrule || undefined,
            extendedProps: {
              rrule: slot.rrule || undefined,
              dtStart:
                convertToRruleDate(new Date(slot.startTime)) || undefined,
              dtEnd: convertToRruleDate(new Date(slot.endTime)) || undefined,
            },
          }))
        )
      );

      setVacations(
        user.teacher.vacations.map((vac: Vacation) => ({
          id: vac.id.toString(),
          title: "Vacation",
          start: vac.date,
          end: vac.date,
          allDay: true,
          color: "tomato",
          vacation: true,
        }))
      );
    };
    fetchTeacher();
  }, [email]);

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

        if (isTaken) {
          const result = await updateTeacher(teacher);
          logger.info({ result, teacher }, "Teacher updated successfully");
        } else {
          const result = await addTeacher(teacher);
          logger.info({ result, teacher }, "Teacher added successfully");
        }

        router.push("/account/teachers");
      } catch (err) {
        logger.error({ err }, "Error adding/updating teacher");
      }
    },
    [router, timeSlots, vacations]
  );

  const formik = useFormik<TeacherFormValues>({
    initialValues: {
      name: name ?? "",
      email: email ?? "",
      password: email ? "********" : "",
      timezone: "utc",
    },
    enableReinitialize: true,
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

const shapeTimeSlots = (timeSlots: EventInput[]): EventInput[] => {
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
      color: "gray",
      start: start.toISOString(),
      end: end.toISOString(),
      duration,
    };
  });
};
